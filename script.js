const boardsContainer = document.getElementById('boards');
const addBoardBtn = document.getElementById('add-board-btn');
let draggedCard;
let draggedBoard;

function createBoardElement(boardName, boardColor) {
    const board = document.createElement('div');
    board.className = 'board';
    board.style.backgroundColor = boardColor; // Set the background color for the board
    board.innerHTML = `<h3>${boardName}</h3>`;
    
    const addCardBtn = document.createElement('button');
    addCardBtn.textContent = 'Add New Card';
    addCardBtn.onclick = function() {
        const cardText = prompt('Enter card content:');
        if (cardText) {
            const card = createCardElement(cardText);
            board.appendChild(card);
        }
    };
    
    const deleteBoardBtn = document.createElement('button');
    deleteBoardBtn.textContent = 'Delete Board';
    deleteBoardBtn.onclick = function() {
        if (confirm('Are you sure you want to delete this board?')) {
            boardsContainer.removeChild(board);
        }
    };
    
    board.appendChild(addCardBtn);
    board.appendChild(deleteBoardBtn);

    // Add drag-and-drop functionality to the board
    board.setAttribute('draggable', true);

    board.addEventListener('dragstart', function(event) {
        draggedBoard = event.target;
    });

    board.addEventListener('dragover', function(event) {
        event.preventDefault();
    });

    board.addEventListener('drop', function(event) {
        event.preventDefault();
        if (draggedBoard !== event.target) {
            boardsContainer.insertBefore(draggedBoard, event.target);
        }
    });

    return board;
}

function createCardElement(cardText) {
    const card = document.createElement('div');
    card.className = 'card';

    const cardContent = document.createElement('span'); // Use a <span> for displaying card text
    cardContent.textContent = cardText;
    card.appendChild(cardContent);

    card.setAttribute('draggable', true);
    
    card.addEventListener('dragstart', function(event) {
        const target = event.target;
    if (target.classList.contains('card')) {
        draggedCard = target;
        sourceBoard = target.closest('.board');
        event.dataTransfer.setData('text/plain', target.textContent);
        event.dataTransfer.effectAllowed = 'move';
    }
});
    
    card.addEventListener('click', function() {
        const cardInput = document.createElement('input');
        cardInput.type = 'text';
        cardInput.value = cardText;

        cardInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                cardContent.textContent = cardInput.value;
                cardText = cardInput.value; // Update the cardText variable
            }
        });

        cardInput.addEventListener('blur', function() {
            cardContent.textContent = cardText; // Revert the changes if focus is lost without pressing Enter
        });

        cardContent.replaceWith(cardInput);
        cardInput.focus();
    });

    return card;
}


function openModal(cardText, cardElement) {
    const modal = document.getElementById('modal');
    const modalCardContent = document.getElementById('modal-card-content');
    const modalCommentsSection = document.getElementById('modal-comments-section');
    const modalCommentInput = document.getElementById('modal-comment-input');
    
    modalCardContent.textContent = cardText;
    
    // Clear existing comments
    modalCommentsSection.innerHTML = '';
    
    // Retrieve comments from cardElement
    const comments = cardElement.dataset.comments ? JSON.parse(cardElement.dataset.comments) : [];
    
    comments.forEach(commentText => {
        const comment = document.createElement('div');
        comment.className = 'comment';
        comment.textContent = commentText;
        modalCommentsSection.appendChild(comment);
    });
    
    modal.style.display = 'block';
    
    // Save the current comments to the modal (for later update)
    modal.dataset.cardElementId = cardElement.id;
    modal.dataset.comments = JSON.stringify(comments);
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
}

function addModalComment() {
    const modal = document.getElementById('modal');
    const modalCommentInput = document.getElementById('modal-comment-input');
    const modalCommentsSection = document.getElementById('modal-comments-section');
    
    const cardElementId = modal.dataset.cardElementId;
    const cardElement = document.getElementById(cardElementId);
    
    const comments = modal.dataset.comments ? JSON.parse(modal.dataset.comments) : [];
    const commentText = modalCommentInput.value.trim();
    
    if (commentText) {
        const comment = document.createElement('div');
        comment.className = 'comment';
        comment.textContent = commentText;
        modalCommentsSection.appendChild(comment);
        comments.push(commentText);
        cardElement.dataset.comments = JSON.stringify(comments);
        modal.dataset.comments = JSON.stringify(comments);
        modalCommentInput.value = '';
    }
}

function toggleCommentInput() {
    const commentInputSection = document.getElementById('comment-input-section');
    const isVisible = commentInputSection.style.display === 'block';
    commentInputSection.style.display = isVisible ? 'none' : 'block';
}


function addBoard() {
    const boardName = prompt('Enter board name:');
    const boardColor = prompt('Enter board color (e.g., red, #00ff00, rgb(0, 0, 255)):');
  
    if (boardName && boardColor) {
      const boardData = { name: boardName, color: boardColor };
      
      // Make a POST request to the server to save the new board
      fetch('/api/boards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(boardData)
      })
      .then(response => response.json())
      .then(data => {
        // After saving the board, add it to the UI
        const board = createBoardElement(data.name, data.color);
        boardsContainer.appendChild(board);
      })
      .catch(error => console.error('Error saving board:', error));
    }
  }

addBoardBtn.addEventListener('click', addBoard);

document.addEventListener('dragover', function(event) {
    event.preventDefault();
});

document.addEventListener('drop', function(event) {
    event.preventDefault();
    const cardText = event.dataTransfer.getData('text/plain');
    const targetCard = event.target.closest('.card');
    const targetBoard = event.target.closest('.board');

    if (targetCard) {
        if (targetCard !== draggedCard) {
            const newCard = createCardElement(cardText);
            targetBoard.insertBefore(newCard, targetCard);
            sourceBoard.removeChild(draggedCard);
        }
    } else if (targetBoard) {
        targetBoard.appendChild(draggedCard); // Append the dragged card to the target board
    }
});
