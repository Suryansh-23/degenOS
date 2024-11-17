import { time } from "console";
import { Hex } from "viem";

export class Accounts {
    private accounts: Map<string, string>;

    constructor() {
        this.accounts = new Map();
    }

    public add(address: Hex) {
        // takes in address and sets the mapping with the current timestamp
        this.accounts.set(address, Date.now().toString());
    }

    public get(address: Hex): string | undefined {
        // returns the timestamp of the address
        return this.accounts.get(address);
    }

    public isAccount(address: Hex): boolean {
        return this.accounts.has(address);
    }

    login(address: Hex): [boolean, string | undefined] {
        // checks if the address is in the mapping, if it is, it returns true
        let newUser = true;
        if (this.accounts.has(address)) {
            newUser = false;
        }

        this.add(address);
        return [newUser, this.accounts.get(address)];
    }
}

