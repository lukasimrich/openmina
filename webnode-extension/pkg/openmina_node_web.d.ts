/* tslint:disable */
/* eslint-disable */
/**
 * Automatically run after wasm is loaded.
 */
export function main(): void;
export function build_env(): any;
export function run(block_producer: any, seed_nodes_url?: string, genesis_config_url?: string): Promise<RpcSender>;
/**
 * Entry point for web workers
 */
export function wasm_thread_entry_point(ptr: number): void;
export class Ledger {
  private constructor();
  free(): void;
  latest(): LedgerSelected;
}
export class LedgerAccounts {
  private constructor();
  free(): void;
  all(): Promise<any>;
}
export class LedgerSelected {
  private constructor();
  free(): void;
  accounts(): LedgerAccounts;
}
export class RpcSender {
  private constructor();
  free(): void;
  state(): State;
  stats(): Stats;
  transaction_pool(): TransactionPool;
  transition_frontier(): TransitionFrontier;
  ledger(): Ledger;
  status(): Promise<any>;
  make_heartbeat(): Promise<any>;
}
export class State {
  private constructor();
  free(): void;
  get(filter: string): Promise<any>;
  peers(): Promise<any>;
  message_progress(): Promise<any>;
}
export class Stats {
  private constructor();
  free(): void;
  actions(id: any): Promise<any>;
  sync(limit?: number): Promise<any>;
  block_producer(): Promise<any>;
}
export class TransactionPool {
  private constructor();
  free(): void;
  inject(): TransactionPoolInject;
  get(): Promise<any>;
}
export class TransactionPoolInject {
  private constructor();
  free(): void;
  payment(payments: any): Promise<any>;
}
export class TransitionFrontier {
  private constructor();
  free(): void;
  best_chain(): TransitionFrontierBestChain;
}
export class TransitionFrontierBestChain {
  private constructor();
  free(): void;
  user_commands(): Promise<any>;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly main: () => void;
  readonly build_env: () => any;
  readonly run: (a: any, b: number, c: number, d: number, e: number) => any;
  readonly __wbg_state_free: (a: number, b: number) => void;
  readonly state_get: (a: number, b: number, c: number) => any;
  readonly state_peers: (a: number) => any;
  readonly state_message_progress: (a: number) => any;
  readonly __wbg_transitionfrontier_free: (a: number, b: number) => void;
  readonly __wbg_transitionfrontierbestchain_free: (a: number, b: number) => void;
  readonly transitionfrontier_best_chain: (a: number) => number;
  readonly transitionfrontierbestchain_user_commands: (a: number) => any;
  readonly __wbg_rpcsender_free: (a: number, b: number) => void;
  readonly rpcsender_state: (a: number) => number;
  readonly rpcsender_ledger: (a: number) => number;
  readonly rpcsender_status: (a: number) => any;
  readonly rpcsender_make_heartbeat: (a: number) => any;
  readonly __wbg_ledger_free: (a: number, b: number) => void;
  readonly __wbg_ledgerselected_free: (a: number, b: number) => void;
  readonly __wbg_ledgeraccounts_free: (a: number, b: number) => void;
  readonly ledger_latest: (a: number) => number;
  readonly ledgerselected_accounts: (a: number) => number;
  readonly ledgeraccounts_all: (a: number) => any;
  readonly __wbg_stats_free: (a: number, b: number) => void;
  readonly stats_actions: (a: number, b: any) => any;
  readonly stats_sync: (a: number, b: number) => any;
  readonly stats_block_producer: (a: number) => any;
  readonly __wbg_transactionpool_free: (a: number, b: number) => void;
  readonly __wbg_transactionpoolinject_free: (a: number, b: number) => void;
  readonly transactionpool_inject: (a: number) => number;
  readonly transactionpool_get: (a: number) => any;
  readonly transactionpoolinject_payment: (a: number, b: any) => any;
  readonly rpcsender_transaction_pool: (a: number) => number;
  readonly rpcsender_transition_frontier: (a: number) => number;
  readonly rpcsender_stats: (a: number) => number;
  readonly wasm_thread_entry_point: (a: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_export_6: WebAssembly.Table;
  readonly closure182_externref_shim: (a: number, b: number, c: any) => void;
  readonly _dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hf3ca83353bc1791d: (a: number, b: number) => void;
  readonly _dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hebd9022714556fe5: (a: number, b: number) => void;
  readonly closure6377_externref_shim: (a: number, b: number, c: any) => void;
  readonly closure6398_externref_shim: (a: number, b: number, c: any) => void;
  readonly closure6419_externref_shim: (a: number, b: number, c: any, d: any) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
