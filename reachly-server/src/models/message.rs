// MessageDto is defined in models::conversation (single source of truth).
// Re-export it here so that `use crate::models::message::MessageDto` still compiles.
pub use crate::models::conversation::MessageDto;
