import StargateRotor from "./rotor/stargateRotor";
import { configureStore, EnhancedStore } from '@reduxjs/toolkit'

import { Photons } from "quantum-tensors";
import { v4 as uuidv4 } from "uuid";

import type { QuantaInterface } from "./quanta/quanta"

/**
 * @description A stargate machine is a component that can encrypt, send, and receive quanta.
 * It will ultimately convert data and matter into quanta and back as well.
 * A stargate machine is composed of multiple rotors.
 * Each rotor performs one or more operations on the input quanta.
 * The output quanta may be entirely different from the input quanta, or encrypted.
 */
export default class StargateMachine {
    public readonly id: string;
    public readonly rotors: Array<StargateRotor>;
    private channelOpen: boolean;
    /**
     * The stargate machine is using a Redux store to manage its state.
     * The state should be immutable and deterministic.
     */
    private readonly stateMachine: EnhancedStore;

    /**
     * @description A test reducer for the Redux store.
     * @param state 
     * @param action 
     * @returns 
     */
    private testReducer(state = [], action: { type: string; }) {
        switch (action.type) {
          default:
            return state
        }
      }

    public constructor() {
        this.id = uuidv4();
        this.rotors = [];
        this.channelOpen = false;
        this.stateMachine = configureStore({
            reducer: {
              todos: this.testReducer,
            }
          });
    }

    public isStargateOpen(): boolean {
        return this.channelOpen;
    }

    public canOpenStargate(): { canOpen: boolean, reason: string | null } {
        return {
            canOpen: true,
            reason: null
        };
    }
    public openStargate(): StargateMachine {
        if (this.channelOpen) {
            throw new Error(`Stargate already open`);
        }
        const { canOpen, reason } = this.canOpenStargate();
        if (!canOpen && (reason === null)) {
            throw new Error(`Unknown error`);
        } else if (!canOpen && (reason !== null)) {
            throw new Error(reason);
        }
        this.channelOpen = true;
        return this;
    }
    public closeStargate(immediate = false): StargateMachine {
        if (!this.channelOpen) {
            throw new Error(`Stargate not open`);
        }
        if (!immediate) {
            // check for any remaining data in the input stream or at any of the gates
            // flush any remaining data
        }
        for (let i = 0; i < this.rotors.length; i++) {
        }
        this.channelOpen = false;
        return this;
    }
    public foo() {
       if (this.stateMachine === undefined) {
           return;
       }
    }
    public pushQuanta(quanta: Photons): StargateMachine {
        if (!this.channelOpen) {
            throw new Error(`Stargate not open`);
        }
        console.log(quanta);
        throw new Error(`Not implemented`);
        return this;
    }
}