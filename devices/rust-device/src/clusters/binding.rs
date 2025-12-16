//! Binding cluster implementation for Matter virtual devices.
//!
//! The Binding cluster (ID 0x001E / 30) allows devices to store bindings to other
//! devices, enabling device-to-device communication (e.g., a switch binding to lights).
//!
//! This is a simple implementation that stores bindings in memory.

use core::cell::RefCell;
use core::num::NonZeroU8;

use log::info;

use rs_matter::dm::{
    ArrayAttributeRead, ArrayAttributeWrite, AttrDetails, Cluster, Dataver, ReadContext,
    WriteContext,
};
use rs_matter::error::{Error, ErrorCode};
use rs_matter::tlv::{TLVArray, TLVBuilderParent};
use rs_matter::with;

// Import Binding cluster types from Matter IDL
rs_matter::import!(Binding);

pub use binding::*;

/// Maximum bindings per endpoint
pub const MAX_BINDINGS_PER_ENDPOINT: usize = 10;

/// In-memory binding storage for a single endpoint.
#[derive(Debug, Clone, Default)]
pub struct BindingEntry {
    pub node: Option<u64>,
    pub group: Option<u16>,
    pub endpoint: Option<u16>,
    pub cluster: Option<u32>,
    pub fabric_idx: u8,
}

/// Handler for the Binding cluster.
///
/// Stores bindings in memory and handles read/write operations.
#[derive(Debug)]
pub struct BindingHandler {
    dataver: Dataver,
    endpoint_id: u16,
    bindings: RefCell<Vec<BindingEntry>>,
}

impl BindingHandler {
    /// The cluster definition for this handler.
    pub const CLUSTER: Cluster<'static> = FULL_CLUSTER
        .with_attrs(with!(required; AttributeId::Binding))
        .with_cmds(with!());

    /// Create a new Binding handler for the given endpoint.
    pub fn new(dataver: Dataver, endpoint_id: u16) -> Self {
        Self {
            dataver,
            endpoint_id,
            bindings: RefCell::new(Vec::new()),
        }
    }

    /// Adapt this handler to the generic rs-matter Handler trait.
    pub fn adapt(&self) -> HandlerAdaptor<&Self> {
        HandlerAdaptor(self)
    }

    /// Get the endpoint ID this handler is associated with.
    pub fn endpoint_id(&self) -> u16 {
        self.endpoint_id
    }

    /// Get current bindings (for testing/debugging).
    pub fn get_bindings(&self) -> Vec<BindingEntry> {
        self.bindings.borrow().clone()
    }

    /// Read bindings, optionally filtered by fabric.
    fn read_bindings<P: TLVBuilderParent>(
        &self,
        attr: &AttrDetails<'_>,
        builder: ArrayAttributeRead<TargetStructArrayBuilder<P>, TargetStructBuilder<P>>,
    ) -> Result<P, Error> {
        let bindings = self.bindings.borrow();

        // Filter by fabric if fabric filtering is enabled
        let filtered: Vec<_> = bindings
            .iter()
            .filter(|b| !attr.fab_filter || b.fabric_idx == attr.fab_idx)
            .collect();

        match builder {
            ArrayAttributeRead::ReadAll(mut arr_builder) => {
                for entry in filtered {
                    // Build the TargetStruct - fields must be in IDL order
                    arr_builder = arr_builder
                        .push()?
                        .node(entry.node)?
                        .group(entry.group)?
                        .endpoint(entry.endpoint)?
                        .cluster(entry.cluster)?
                        .fabric_index(Some(entry.fabric_idx))?
                        .end()?;
                }
                arr_builder.end()
            }
            ArrayAttributeRead::ReadOne(index, builder) => {
                let entry = filtered
                    .get(index as usize)
                    .ok_or(ErrorCode::ConstraintError)?;

                builder
                    .node(entry.node)?
                    .group(entry.group)?
                    .endpoint(entry.endpoint)?
                    .cluster(entry.cluster)?
                    .fabric_index(Some(entry.fabric_idx))?
                    .end()
            }
            ArrayAttributeRead::ReadNone(builder) => builder.end(),
        }
    }

    /// Write bindings for a specific fabric.
    fn write_bindings(
        &self,
        fab_idx: NonZeroU8,
        value: ArrayAttributeWrite<TLVArray<'_, TargetStruct<'_>>, TargetStruct<'_>>,
    ) -> Result<(), Error> {
        let mut bindings = self.bindings.borrow_mut();

        match value {
            ArrayAttributeWrite::Replace(list) => {
                // Count new entries to check limit
                let count = list.iter().count();
                if count > MAX_BINDINGS_PER_ENDPOINT {
                    return Err(ErrorCode::ConstraintError.into());
                }

                // Remove all bindings for this fabric
                bindings.retain(|b| b.fabric_idx != fab_idx.get());

                // Add new bindings
                for entry in list {
                    let entry = entry?;
                    let binding = BindingEntry {
                        node: entry.node().ok().flatten(),
                        group: entry.group().ok().flatten(),
                        endpoint: entry.endpoint().ok().flatten(),
                        cluster: entry.cluster().ok().flatten(),
                        fabric_idx: fab_idx.get(),
                    };
                    bindings.push(binding);
                }

                info!(
                    "Binding: replaced all bindings for fabric {}, now {} entries",
                    fab_idx.get(),
                    bindings.len()
                );
            }
            ArrayAttributeWrite::Add(entry) => {
                if bindings.len() >= MAX_BINDINGS_PER_ENDPOINT {
                    return Err(ErrorCode::ConstraintError.into());
                }

                let node = entry.node().ok().flatten();
                let endpoint = entry.endpoint().ok().flatten();
                let binding = BindingEntry {
                    node,
                    group: entry.group().ok().flatten(),
                    endpoint,
                    cluster: entry.cluster().ok().flatten(),
                    fabric_idx: fab_idx.get(),
                };
                bindings.push(binding);

                info!(
                    "Binding: added binding to node {:?}, endpoint {:?}",
                    node, endpoint
                );
            }
            ArrayAttributeWrite::Update(index, entry) => {
                // Find the binding at the given index for this fabric
                // Collect indices first, then drop the borrow before mutating
                let actual_idx = {
                    let fabric_indices: Vec<_> = bindings
                        .iter()
                        .enumerate()
                        .filter(|(_, b)| b.fabric_idx == fab_idx.get())
                        .map(|(i, _)| i)
                        .collect();

                    *fabric_indices
                        .get(index as usize)
                        .ok_or(ErrorCode::ConstraintError)?
                };

                bindings[actual_idx] = BindingEntry {
                    node: entry.node().ok().flatten(),
                    group: entry.group().ok().flatten(),
                    endpoint: entry.endpoint().ok().flatten(),
                    cluster: entry.cluster().ok().flatten(),
                    fabric_idx: fab_idx.get(),
                };

                info!("Binding: updated binding at index {}", index);
            }
            ArrayAttributeWrite::Remove(index) => {
                // Find the binding at the given index for this fabric
                let fabric_indices: Vec<_> = bindings
                    .iter()
                    .enumerate()
                    .filter(|(_, b)| b.fabric_idx == fab_idx.get())
                    .map(|(i, _)| i)
                    .collect();

                let actual_idx = fabric_indices
                    .get(index as usize)
                    .ok_or(ErrorCode::ConstraintError)?;

                bindings.remove(*actual_idx);

                info!("Binding: removed binding at index {}", index);
            }
        }

        Ok(())
    }
}

impl ClusterHandler for BindingHandler {
    const CLUSTER: Cluster<'static> = Self::CLUSTER;

    fn dataver(&self) -> u32 {
        self.dataver.get()
    }

    fn dataver_changed(&self) {
        self.dataver.changed();
    }

    fn binding<P: TLVBuilderParent>(
        &self,
        ctx: impl ReadContext,
        builder: ArrayAttributeRead<TargetStructArrayBuilder<P>, TargetStructBuilder<P>>,
    ) -> Result<P, Error> {
        self.read_bindings(ctx.attr(), builder)
    }

    fn set_binding(
        &self,
        ctx: impl WriteContext,
        value: ArrayAttributeWrite<TLVArray<'_, TargetStruct<'_>>, TargetStruct<'_>>,
    ) -> Result<(), Error> {
        let fab_idx = NonZeroU8::new(ctx.attr().fab_idx).ok_or(ErrorCode::Invalid)?;
        self.write_bindings(fab_idx, value)?;
        self.dataver.changed();
        Ok(())
    }
}
