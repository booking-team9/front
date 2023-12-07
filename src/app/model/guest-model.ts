import { Password } from "primeng/password";
import { Account } from "./account-model";
import {Address} from "./address-model";


export interface Guest extends Account {
    firstName: string;
    lastName: string;
    phone: string;
    timesCancelled: number;
    address: Address;
    country: string;
    // favorites: Array<Accommodation>;


}