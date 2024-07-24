// Function to toggle modal display
const toggleModal = (modalElement, displayValue) => {
  modalElement.style.display = displayValue;
};

// Modal 1 controls
openModalButton.addEventListener('click', () => {
  toggleModal(modalContainer, 'flex');
});

closeModalButton.addEventListener('click', () => {
  toggleModal(modalContainer, 'none');
});

nextModalButton.addEventListener('click', () => {
  toggleModal(modalContainer, 'none');
  toggleModal(modal2, 'flex');
});

// Modal 2 controls
next_button.addEventListener('click', () => {
  toggleModal(modalContainer3, 'flex');
  toggleModal(modal2, 'none');
});

backModalButton.addEventListener('click', () => {
  toggleModal(modal2, 'none');
  toggleModal(modalContainer, 'flex');
});

// Modal 3 controls
lastModalButton.addEventListener('click', () => {
  toggleModal(modalContainer3, 'none');
  toggleModal(modal2, 'flex');
});

create_modal.addEventListener('click', () => {
  toggleModal(modalContainer3, 'none');
  toggleModal(final_modal, 'flex');
});

close_transaction.addEventListener('click', () => {
  toggleModal(final_modal, 'none');
});
