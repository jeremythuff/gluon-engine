import * as THREE from "three";
import {Observable} from "@reactivex/rxjs/dist/cjs/Rx";

import {AbstractRenderCycle} from "./abstracts/AbstractRenderCycle";
import {Controlable} from "./interface/Controlable";
import State from "./State";

import {RenderPhase} from "../enum/RenderPhase";

/**
 * The Game class is the central class to all Gluon games. By extending
 * this class into you game main glass, and decorating it with the [[GameMain]]
 * decorator, it will be the main entry point for your game.
 */
export default class Game extends AbstractRenderCycle implements Controlable {

	private name : string;

	private renderer : THREE.WebGLRenderer;

	private framesPerSecond :number;
	private initialStateName :string;
	private activeState :State;
	private states :State[];
	
    constructor(name ?:string) {
    	super();
    	if(name) this.setName(name);
    	this.states = [];
    	this.renderer = new THREE.WebGLRenderer();
    }

    protected _runInit() :Observable<{}[]> {
    	
    	this.activeState = this.getState(this.initialStateName);
    	this.renderer.setSize(window.innerWidth, window.innerHeight);
    	
    	document.body.insertBefore(this.renderer.domElement, document.body.firstChild);
    	
    	const $windowResize = Observable.fromEvent(window, 'resize').debounceTime(100);
    	
    	$windowResize.subscribe(test=>{
    		this.renderer.setSize(window.innerWidth, window.innerHeight);
    	});
    	
    	return Observable.forkJoin(this.activeState.runInit());
    }

	protected _runLoad() :Observable<{}[]> {
		const stateLoad = this.activeState.runLoad();
		stateLoad.subscribe(null,null,()=>{
			this.activeState.setPhase(RenderPhase.READY);
		});
		return Observable.forkJoin(stateLoad);
	}

	protected _runUpdate(delta :number) :void {
		if(this.activeState.phaseIs(RenderPhase.READY))
			this.activeState.runUpdate(delta);
		//this.activeState.controls._runCBs(delta);
	};

	protected _runRender(delta :number) :void {
		if(this.activeState.phaseIs(RenderPhase.READY))
			this.activeState.runRender(delta);
	};

	protected _runPause() :void {
		this.activeState.runPause();
	};

	protected _runUnPause() :void {
		this.activeState.runUnPause();
	};

	protected _runUnLoad() :Observable<{}[]> {
		return Observable.forkJoin(this.activeState.runUnload());
	}

	protected _runDestroy() :Observable<{}[]> {
		return Observable.forkJoin(this.activeState.runDestroy());
	}

	getName() : string {
		return this.name;
	}

	setName(name:string) : void {
		this.name = name;
	}

	getInitialStateName() : string {
		return this.initialStateName;
	}

	setInitialStateName(stateName :string) : void {
		this.initialStateName = stateName;
	}

	getActiveState() :State {
		return this.activeState;
	}

	setActiveState(state :State) :void {

		if(this.activeState) {
			this.activeState.runUnload()
				.take(1)
				.subscribe(null,null,()=>{
					this.activeState = state;
					this.activeState.runInit();
				});
		} else {
			this.activeState = state;
			this.activeState.runInit();
		}

	}

	getFramesPerSecond() :number {
		let frameRate = this.framesPerSecond;
		if(this.getActiveState()) {
			frameRate = this.getActiveState().getFramesPerSecond()
				?this.getActiveState().getFramesPerSecond()
				:this.framesPerSecond;
		}
		return frameRate;
	}

	setFramesPerSecond(framesPerSecond :number) :void {
		this.framesPerSecond = framesPerSecond;
	}

	getState(name :string) : State {
		let foundState = null;

		this.states.some((state :State) => {
			let pred = state.getName() === name;
			if(pred) foundState = state;
			return pred;
		});

		return foundState;
	}

	addState(state :State) : State {
		this.states.push(state);
		return state;
	}

}