// You can write more code here

/* START OF COMPILED CODE */

class Board extends Phaser.GameObjects.Container {

	constructor(scene, x, y) {
		super(scene, x ?? 0, y ?? 0);

		// container_boardBackGround
		const container_boardBackGround = scene.add.container(0, 0);
		this.add(container_boardBackGround);

		// boardBackGround
		const boardBackGround = scene.add.rectangle(0, 0, 600, 600);
		boardBackGround.isFilled = true;
		container_boardBackGround.add(boardBackGround);

		// peg
		const peg = scene.add.image(-80, -140, "peg");
		peg.scaleX = 0.4;
		peg.scaleY = 0.4;
		peg.visible = false;
		container_boardBackGround.add(peg);

		// peg_1
		const peg_1 = scene.add.image(0, -140, "peg");
		peg_1.scaleX = 0.4;
		peg_1.scaleY = 0.4;
		peg_1.visible = false;
		container_boardBackGround.add(peg_1);

		// peg_2
		const peg_2 = scene.add.image(80, -140, "peg");
		peg_2.scaleX = 0.4;
		peg_2.scaleY = 0.4;
		peg_2.visible = false;
		container_boardBackGround.add(peg_2);

		// container_blankPeg
		const container_blankPeg = scene.add.container(0, 0);
		this.add(container_blankPeg);

		this.container_boardBackGround = container_boardBackGround;
		this.container_blankPeg = container_blankPeg;

		/* START-USER-CTR-CODE */
		this.oScene = scene;
		this.levelManager = new LevelManager();

		this.selectedPeg = null;
		this.oScene.input.on('gameobjectdown', this.onPegClick, this);

		this.pegContainer = this.oScene.add.container(0, 0);
		this.add(this.pegContainer);

		this.loadCurrentLevel();
		/* END-USER-CTR-CODE */
	}

	/** @type {Phaser.GameObjects.Container} */
	container_boardBackGround;
	/** @type {Phaser.GameObjects.Container} */
	container_blankPeg;

	/* START-USER-CODE */
	// Write your code here.
	loadCurrentLevel() {
		const level = this.levelManager.getCurrentLevel();
		this.board = level.board;
		this.blankPegPos = level.pegPositions;
		this.clearBoard();
		this.createPegs();
	}
	clearBoard() {
		this.pegContainer.removeAll(true);
		this.container_blankPeg.removeAll(true);
	}
	createPegs() {
		console.log(this.blankPegPos);
		for (let pos of this.blankPegPos) {
			const { row, col, x, y } = pos;
			if (this.board[row][col] !== null) {
				let peg = this.oScene.add.image(x, y, this.board[row][col] === 1 ? "peg" : "peg-blank");
				peg.setScale(0.5);
				peg.setInteractive();
				peg.boardPosition = { row, col };
				if (this.board[row][col] === 1) {
					this.pegContainer.add(peg);
				} else {
					this.container_blankPeg.add(peg);
				}
			}
		}
	}
	onPegClick(pointer, gameObject) {
		if (!gameObject.boardPosition) return;
		this.clearSuggestions();

		if (this.selectedPeg === null) {
			if (this.board[gameObject.boardPosition.row][gameObject.boardPosition.col] === 1) {
				this.selectedPeg = gameObject;
				this.selectedPeg.setTint(0x00ff00); // Highlight selected peg

				const possibleJumps = this.findPossibleJumps(gameObject.boardPosition.row, gameObject.boardPosition.col);
				this.showSuggestions(possibleJumps);
			}
		} else {
			if (this.canJump(this.selectedPeg.boardPosition, gameObject.boardPosition)) {
				this.jump(this.selectedPeg.boardPosition, gameObject.boardPosition);
				this.selectedPeg.clearTint();
				this.selectedPeg = null;
				this.checkGameOver();
				this.clearSuggestions();

			} else {
				// If invalid move, deselect the peg
				this.selectedPeg.clearTint();
				this.selectedPeg = null;
				this.clearSuggestions();
			}
		}
	}
	showSuggestions(possibleJumps) {
		for (let jump of possibleJumps) {
			const peg = this.getPegAtPosition(jump);
			if (peg) {
				peg.setTint(0x0000ff); // Highlight possible jumps in blue
			}
		}
	}

	clearSuggestions() {
		this.container_blankPeg.getAll().forEach(peg => peg.clearTint());
	}
	canJump(from, to) {
		const dx = to.col - from.col;
		const dy = to.row - from.row;

		// Check for horizontal and vertical jumps only
		if ((Math.abs(dx) === 2 && Math.abs(dy) === 0) || // Horizontal
			(Math.abs(dy) === 2 && Math.abs(dx) === 0))   // Vertical
		{
			const middleRow = from.row + dy / 2;
			const middleCol = from.col + dx / 2;

			// Check if all positions are within the board boundaries
			if (this.isValidPosition(from.row, from.col) &&
				this.isValidPosition(middleRow, middleCol) &&
				this.isValidPosition(to.row, to.col)) {

				return (
					this.board[from.row][from.col] === 1 &&
					this.board[middleRow][middleCol] === 1 &&
					this.board[to.row][to.col] === 0
				);
			}
		}
		return false;
	}
	isValidPosition(row, col) {
		return row >= 0 && row < this.board.length &&
			col >= 0 && col < this.board[row].length &&
			this.board[row][col] !== null;
	}

	// jump(from, to) {
	// 	const middleRow = (from.row + to.row) / 2;
	// 	const middleCol = (from.col + to.col) / 2;

	// 	// Update board state
	// 	this.board[from.row][from.col] = 0;
	// 	this.board[middleRow][middleCol] = 0;
	// 	this.board[to.row][to.col] = 1;

	// 	// Update peg visuals
	// 	this.updatePegVisuals(from, 0);
	// 	this.updatePegVisuals({row: middleRow, col: middleCol}, 0);
	// 	this.updatePegVisuals(to, 1);

	// 	// Check for game over after the jump
	// 	this.checkGameOver();
	// }
	jump(from, to) {
		const middleRow = (from.row + to.row) / 2;
		const middleCol = (from.col + to.col) / 2;
	
		// Get the peg object that's jumping
		const jumpingPeg = this.getPegAtPosition(from);
		const targetPos = this.getPegAtPosition(to);
	
		if (jumpingPeg && targetPos) {
			// Create a new peg at the target position
			let newPeg = this.oScene.add.image(jumpingPeg.x, jumpingPeg.y, "peg");
			newPeg.setScale(0.5);
			newPeg.setInteractive();
			newPeg.boardPosition = { row: to.row, col: to.col };
			this.pegContainer.add(newPeg);
	
			// Create the tween for the new peg
			this.oScene.tweens.add({
				targets: newPeg,
				x: targetPos.x,
				y: targetPos.y,
				duration: 300, // Duration of the animation in milliseconds
				ease: 'Power2', // Easing function for smooth movement
				onComplete: () => {
					// Update board state
					this.board[from.row][from.col] = 0;
					this.board[middleRow][middleCol] = 0;
					this.board[to.row][to.col] = 1;
	
					// Remove the jumped-over peg
					const middlePeg = this.getPegAtPosition({row: middleRow, col: middleCol});
					if (middlePeg) {
						this.oScene.tweens.add({
							targets: middlePeg,
							alpha: 0,
							scale: 0.25,
							duration: 100,
							onComplete: () => {
								this.pegContainer.remove(middlePeg);
								middlePeg.destroy();
								// Create a new peg-blank at the middle position
								this.createBlankPeg(middleRow, middleCol);
							}
						});
					}
	
					// Remove the original jumping peg
					this.pegContainer.remove(jumpingPeg);
					jumpingPeg.destroy();
	
					// Create a new peg-blank at the starting position
					this.createBlankPeg(from.row, from.col);
	
					// Remove the peg-blank at the target position
					this.container_blankPeg.remove(targetPos);
					targetPos.destroy();
	
					// Check for game over after the jump is complete
					this.checkGameOver();
				}
			});
		}
	}
	
	// Helper method to create a new blank peg
	createBlankPeg(row, col) {
		const pos = this.blankPegPos.find(p => p.row === row && p.col === col);
		if (pos) {
			let blankPeg = this.oScene.add.image(pos.x, pos.y, "peg-blank");
			blankPeg.setScale(0.5);
			blankPeg.setInteractive();
			blankPeg.boardPosition = { row, col };
			this.container_blankPeg.add(blankPeg);
		}
	}
	findPossibleJumps(row, col) {
		const directions = [
			{ dx: 2, dy: 0 },  // Right
			{ dx: -2, dy: 0 }, // Left
			{ dx: 0, dy: 2 },  // Down
			{ dx: 0, dy: -2 }  // Up
		];

		let possibleJumps = [];

		for (let dir of directions) {
			const toRow = row + dir.dy;
			const toCol = col + dir.dx;
			if (this.canJump({ row, col }, { row: toRow, col: toCol })) {
				possibleJumps.push({ row: toRow, col: toCol });
			}
		}

		return possibleJumps;
	}

	// updatePegVisuals(position, state) {
	// 	const pegToUpdate = this.getPegAtPosition(position);
	// 	if (pegToUpdate) {
	// 		if (state === 1) {
	// 			pegToUpdate.setTexture('peg');
	// 			this.container_blankPeg.remove(pegToUpdate);
	// 			this.pegContainer.add(pegToUpdate);
	// 		} else {
	// 			pegToUpdate.setTexture('peg-blank');
	// 			this.pegContainer.remove(pegToUpdate);
	// 			this.container_blankPeg.add(pegToUpdate);
	// 		}
	// 	}
	// }
	updatePegVisuals(position, state) {
    const pegToUpdate = this.getPegAtPosition(position);
    if (pegToUpdate) {
        if (state === 1) {
            // Change peg-blank to peg
            this.container_blankPeg.remove(pegToUpdate);
            pegToUpdate.destroy();
            let newPeg = this.oScene.add.image(pegToUpdate.x, pegToUpdate.y, "peg");
            newPeg.setScale(0.5);
            newPeg.setInteractive();
            newPeg.boardPosition = position;
            this.pegContainer.add(newPeg);
        } else {
            // Change peg to peg-blank
            this.pegContainer.remove(pegToUpdate);
            pegToUpdate.destroy();
            this.createBlankPeg(position.row, position.col);
        }
    }
}

	getPegAtPosition(position) {
		let peg = null;
		this.pegContainer.iterate((child) => {
			if (child.boardPosition &&
				child.boardPosition.row === position.row &&
				child.boardPosition.col === position.col) {
				peg = child;
				return false; // Stop iteration
			}
		});

		if (!peg) {
			this.container_blankPeg.iterate((child) => {
				if (child.boardPosition &&
					child.boardPosition.row === position.row &&
					child.boardPosition.col === position.col) {
					peg = child;
					return false; // Stop iteration
				}
			});
		}

		return peg;
	}
	checkGameOver() {
		const remainingPegs = this.board.flat().filter(cell => cell === 1).length;
		if (remainingPegs === 1) {
			console.log("Congratulations! You've won!");
			// Implement win condition here (e.g., show a win message, go to next level)
		} else if (!this.hasValidMoves()) {
			console.log(`Game Over! No more valid moves. ${remainingPegs} pegs remaining.`);
			// Implement game over condition here (e.g., show a game over message, restart level)
		}
	}
	hasValidMoves() {
		const directions = [
			{ dx: 2, dy: 0 },  // Right
			{ dx: -2, dy: 0 }, // Left
			{ dx: 0, dy: 2 },  // Down
			{ dx: 0, dy: -2 }  // Up
		];

		for (let row = 0; row < this.board.length; row++) {
			for (let col = 0; col < this.board[row].length; col++) {
				if (this.board[row][col] === 1) {
					for (let dir of directions) {
						const toRow = row + dir.dy;
						const toCol = col + dir.dx;
						if (this.isValidPosition(toRow, toCol) &&
							this.canJump({ row, col }, { row: toRow, col: toCol })) {
							return true;
						}
					}
				}
			}
		}
		return false;
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
