//board
let tileSize = 43;
let rows = 16;
let columns = 16;
let board;
let boardWidth = tileSize * columns;
let boardHeight = tileSize * rows;
let context;

//plane
let planeWidth = tileSize * 2;
let planeHeight = tileSize + (tileSize / 2);
let planeX = tileSize * columns / 2 - tileSize;
let planeY = tileSize * rows - tileSize * 2;
let plane = {
	x : planeX,
	y : planeY,
	width : planeWidth,
	height : planeHeight
}
let planeImg;
let planeVelocityX = tileSize; // plane moving speed

//enemies
let enemiesArray = [];
let enemiesWidth = tileSize * 2;
let enemiesHeight = tileSize + (tileSize / 2);
let enemiesX = tileSize;
let enemiesY = tileSize;
let enemiesImg;
let enemiesRows = 2;
let enemiesColumns = 4;
let enemiesVelocityY = 1;

//bullets
let bulletArray = [];
let bulletVelocityY = -10; //bullet movement speed in the upward direction

//score
let score = 0;
let gameOver = false;
let startTime = Date.now();
let stopTime;
let endTime = 0;
let enemiesAvoided = 0;

window.onload = function() {
	board = document.getElementById("board");
	board.width = boardWidth;
	board.height = boardHeight;
	context = board.getContext("2d"); //used for drawing on the board

	//load and draw image-plane
	planeImg = new Image();
	planeImg.src = "./airplane2.png";
	planeImg.onload = function() {
		context.drawImage(planeImg, plane.x, plane.y, plane.width, plane.height);
	}
	enemiesImg = new Image();
	enemiesImg.src = "./enemy.png";
	createEnemies();
	requestAnimationFrame(update);
	document.addEventListener('keyup', startGame);
	document.addEventListener('keydown', movePlane);
	document.addEventListener('keyup', shoot);
}

function update() {
	requestAnimationFrame(update); //update your animation for the next repaint
	if (gameOver) {
		return;
	}
	context.clearRect(0, 0, boardWidth, boardHeight); //clear the initial position of the plane

	// (re)draw the plane
	context.drawImage(planeImg, plane.x, plane.y, plane.width, plane.height);

	drawTheEnemy();
	drawTheBullets();
	enemiesCollision();
	
	//clear the bullet
	while (bulletArray.length > 0 && (bulletArray[0].used || bulletArray[0].y < 0)) {
		bulletArray.shift(); //removes the first bullet element of the array  
	}

	//next level
	if (enemiesCount == 0) {
		//increase the number of enemies rows by 1
		enemiesRows = Math.min(enemiesRows + 1, rows - 11); //generates the maximum limit of the rows enemy matrix
		enemiesColumns = Math.min(enemiesColumns + 1, columns - 9); //generates the maximum limit of the columns enemy matrix
		enemiesArray = [];
		bulletArray = [];
		createEnemies();
	}

	//score
	context.fillStyle = "black";
	context.font = "20px courier";
	context.fillText("Enemies downed " + score, 5, 20);

	context.fillStyle = "black";
	context.font = "20px courier";
	context.fillText("in a number of seconds equal to " + endTime, 250, 20);

	context.fillStyle = "blue";
	context.font = "20px courier";
	context.fillText("Enemies avoided " + enemiesAvoided, 5, 45);

	context.fillStyle = "green";
	context.font = "20px courier";
	context.fillText("Enemies in the air " + enemiesCount, 5, 70);
}

function drawTheEnemy() {
	for (let i = 0; i < enemiesArray.length; ++i) {
		let enemies = enemiesArray[i];
		if (enemies.alive) {
			enemies.y += enemiesVelocityY;
			context.drawImage(enemiesImg, enemies.x, enemies.y, enemies.width, enemies.height);
		}
		if (enemies.y >= plane.y) {
			enemiesAvoided += enemiesCount;
			filterAndResetEnemies();
		}
	}
}

function drawTheBullets() {
	for (let i = 0; i < bulletArray.length; ++i) {
		bullet = bulletArray[i];
		bullet.y += bulletVelocityY;
		context.fillStyle = 'red';
		context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

		//bullet collision with enemies
		for (let j = 0; j < enemiesArray.length; ++j) {
			let enemies = enemiesArray[j];
			if (!bullet.used && enemies.alive && detectCollisionBullet(bullet, enemies)) {
				bullet.used = true;
				enemies.alive = false;
				--enemiesCount;
				++score;
			}
		}
	}
}

function enemiesCollision() {
	//Airplane collision with enemies
	for (let j = 0; j < enemiesArray.length; ++j) {
		let enemies = enemiesArray[j];
		if (enemies.alive && detectCollisionEnemies(plane, enemies)) {
			stopTime = Date.now();
			endTime = Math.round((stopTime - startTime) / 1000);
			gameOver = true;
		}
	}
	if (gameOver) {
		context.fillStyle="red";
		context.font="100px courier";
		context.fillText("GAME OVER", 70, 300);
	}
}

function filterAndResetEnemies() {
	// Filter the enemiesArray to keep only those enemies that have the alive property set to true
	enemiesArray = enemiesArray.filter(enemies => enemies.alive);
	reDrawTheEnemy();
}

function reDrawTheEnemy() {
	enemiesArray.forEach((enemies) => {
		enemies.y = enemiesY + Math.random() * enemiesHeight;
		context.drawImage(enemiesImg, enemies.x, enemies.y, enemies.width, enemies.height);
	});
}

function movePlane(e) {
	if (gameOver) {
		return;
	}
	if (e.code == 'ArrowLeft' && plane.x - planeVelocityX >= 0) {
		plane.x -= planeVelocityX; //move left one tile
	} else if (e.code == 'ArrowRight' && plane.x + planeVelocityX + plane.width <= boardWidth) {
		plane.x += planeVelocityX; //move right one tile
	}
}

function startGame(e) {
	if (e.code == 'KeyS' || e.code == 'Keys') {
		enemiesArray = [];
		bulletArray = [];
		enemiesRows = 2;
		enemiesColumns = 4;
		score = 0;
		gameOver = false;
		startTime = Date.now();
		endTime = 0;
		enemiesVelocityY = 1;
		createEnemies();
	}
}

function createEnemies() {
	for (let i = 0; i < enemiesColumns; ++i) {
		for (let j = 0; j < enemiesRows; ++j) {
			let enemies = {
				img : enemiesImg,
				x : enemiesX + i * enemiesWidth,
				y : enemiesY + j * enemiesHeight,
				width : enemiesWidth,
				height : enemiesHeight,
				alive : true
			}
			enemiesArray.push(enemies);
		}
	}
	enemiesCount = enemiesArray.length;
}

function shoot(e) {
	if (gameOver) {
		return;
	}
	if (e.code == 'Space') {
		let bullet = {
			x : plane.x + planeWidth * 15 / 31,
			y : plane.y,
			width : tileSize / 15,  //bullet thickness
			height : tileSize / 2, //bullet length
			used : false
		}
		bulletArray.push(bullet);
	}
}

function detectCollisionBullet(a, b) {
	return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function detectCollisionEnemies(a, b) {
	return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}
