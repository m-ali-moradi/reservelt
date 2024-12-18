<template>
  <div class="modal" v-if="showModal" style="display: block;" @click.self="cancel">
    <div class="modal-content">
      <h4>Are you sure?</h4>
      <p>Do you really want to delete your account? This action cannot be undone.</p>
      <button @click="$emit('confirm')" class="btn btn-danger">Yes, Delete</button>
      <button @click="$emit('cancel')" class="btn btn-secondary">Cancel</button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    showModal: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["confirm", "cancel"],
};
</script>
