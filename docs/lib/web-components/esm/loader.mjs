import { a as patchEsm, b as bootstrapLazy } from './index-3b92e0a1.js';

const defineCustomElements = (win, options) => {
  if (typeof window === 'undefined') return Promise.resolve();
  return patchEsm().then(() => {
  return bootstrapLazy([["nel-expand-item_11",[[1,"nel-expand-item",{"disabled":[516],"open":[516],"ready":[1028],"size":[514]},[[0,"click","onClick"],[0,"keydown","onKeyDown"]]],[1,"nel-item-collection",{"align":[513],"clear":[516],"disabled":[516],"ready":[1028],"resizable":[516],"sort":[513]}],[1,"nel-list-item",{"color":[513],"clear":[516],"deletable":[516],"disabled":[516],"ready":[1028],"selectable":[516]},[[0,"click","onclick"],[0,"keydown","onKeyDown"]]],[1,"nel-modal-view",{"align":[513],"open":[1540],"ready":[1028]}],[1,"nel-network-connection",{"available":[516],"ready":[1028]},[[8,"online","onOnline"],[8,"offline","onOffline"]]],[1,"nel-on-off",{"disabled":[516],"on":[1540],"ready":[1028],"size":[514]},[[0,"click","onClick"]]],[1,"nel-slicer",{"clear":[516],"disabled":[516],"ready":[1028]},[[0,"click","onclick"]]],[1,"nel-status-badge",{"disabled":[516],"label":[513],"pre":[513],"rag":[514],"ready":[1028],"suf":[513]}],[1,"nel-text-input",{"cleartext":[1540],"disabled":[516],"mask":[513],"maxlength":[514],"minlength":[514],"pattern":[513],"placeholder":[513],"ready":[1028],"value":[513],"width":[514]},[[0,"input","onInput"],[0,"keydown","onKeyDown"],[0,"paste","onPaste"],[0,"search","onSearch"]]],[1,"nel-text-tag",{"color":[513],"deletable":[516],"disabled":[516],"label":[513],"ready":[1028],"selectable":[516],"delete":[64]},[[0,"click","onClick"],[0,"keydown","onKeyDown"]]],[1,"nel-tip",{"expires":[1538],"for":[1537],"ready":[1028],"show":[1540]}]]]], options);
  });
};

export { defineCustomElements };
