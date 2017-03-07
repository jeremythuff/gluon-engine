import * as THREE from "three";
import Game from "./Game";

export default class Engine {
	
	private clock : THREE.Clock;
	private running: boolean;
	private game: Game;

	private defaultFramesPerSecond :number = 30;
	private framesPerSecond :number;
	private lastFrameTime = 0;

	constructor(game: Game) {
		this.setGame(game);
		this.clock = new THREE.Clock();
	}

	private animationLoop() {
		if(this.running) {
			window.requestAnimationFrame(this.animationLoop.bind(this));
			const delta =  this.clock.getDelta();
			const now = this.clock.getElapsedTime();
			
			if(this.game && this.game.isRunning()) this.game.update(delta);

			const gameFramesPerSecond :number = this.getGame().getFramesPerSecond();
			const currentFramesPerSecond :number = gameFramesPerSecond?gameFramesPerSecond:this.framesPerSecond;

			if(this.game && this.game.isRunning() && (now - this.lastFrameTime)*1000 > (1000 / currentFramesPerSecond)) {
				this.lastFrameTime = now;
				this.game.render(delta);
			}	
		}
	}

	getGame() : Game {
		return this.game;
	}

	setGame(game:Game) : void {
		this.game = game;
	}

	start() :Game {
		this.running = true;
		let game = this.getGame();

		const engineFramesPerSecond :number = 30;
		const gameFramesPerSecond :number = this.getGame().getFramesPerSecond();
		
		const famesPerSecond :number = gameFramesPerSecond?gameFramesPerSecond:this.defaultFramesPerSecond;

		this.animationLoop();
		game.init().subscribe(()=>{
			game.load().subscribe(()=>{
				game.isRunning(true);
				setTimeout(()=>{this.stop()}, 5000);
			});
		});
		return game;
	}

	stop() :void {
		this.running=false;
		this.getGame().isRunning(false);
		this.getGame().destroy();
	}

}