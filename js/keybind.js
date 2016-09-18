$(function() {
  $(window).keydown(function(event) {
    if (event.defaultPrevented) {
    return; // Should do nothing if the key event was already consumed.
  }
    if (event.ctrlKey) {
      switch (event.key) {
        case 'Enter': // enterKey
          console.table(Chr);
          var text = '';
          for (i = 0; i < len(TYPE.PLAYER); i = (i + 1) | 0) {
            text += Chr[at(TYPE.PLAYER, i)].name + 'の攻撃力は' + Chr[at(TYPE.PLAYER, i)].ATK() + '\n';
          }
          console.log(text);
          // return false;
          break;
        case 'c': // CKey
          console.table(Chr[at(TYPE.ENEMY, enemyIndex)].com);
          // return false;
          break;
        case 'p':
          console.log(playerFlag.show());
          break;

        default:
          return;
      }
    }
    event.preventDefault();
  });
});