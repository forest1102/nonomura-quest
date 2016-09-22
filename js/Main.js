/*global $ len TYPE Player Enemy SCENE SELECTOR setTalk frameTime Chr*/
$(function() {
  var i=0;
  
  var COM_TYPE={
    ATTACK  : 0,
    MAGIC   : 1,
    DEFFENSE:2
  };

  window.TYPE = {
    'PLAYER': 0,
    'ENEMY' : 1,
    'MAX'   : 2,
  };

  window.SELECTOR = {
    'RESULT_DIV'   : $('#resultDiv'),
    'CHOOSE_DIV'   : $('#chooseDiv'),
    'RESULT'       : $('#result'),
    'AUDIO_TAG'    : $('#sounds'),
    'BODY'         : $('body'),
    'COMLIST'      : $("#commandDiv ul"),
    'ENEMYIMAGE'   : $('#enemyImageDiv img'),
    'STATUS_DIV'   : $('#StatusDiv'),
    'WRRAPPER'     : $('#wrapper'),
    'TITLESCENE'   : $('#titleScene'),
    'BATTLESCENE'  : $('#battleScene'),
    'GAMEOVERSCENE': $('#gameoverScene'),
    'MAGIC_LIST'   : $('#magicDiv ul'),
    'ENEMY_STATUS' : $('#enemyStatusDiv')
  };

  window.SCENE = {
    'TITLE' : 0,
    'BATTLE': 1
  };

  window.frameTime  = 1500;
  window.begin      = [0, 0, 0];
  window.playerNum  = 0;
  window.endFlag    = false;
  window.initflag   = false;
  window.enemyIndex = 0;
  window.scene      = SCENE.TITLE;
  window.Chr        = [];
  window.magic      = [];
  window.i          = 0;
  var soundFlag;
  SELECTOR.RESULT_DIV.hide();

  var gameScene = (function () {
    return {
      'draw': {
        'title': (function () {
          SELECTOR.BATTLESCENE.hide();
          SELECTOR.TITLESCENE.show();
        })(),
        'main': function () {
          SELECTOR.TITLESCENE.hide();
          SELECTOR.BATTLESCENE.show();
          soundFlag = confirm('音を出しますか？') || false;
        },
        'over': function () {
          SELECTOR.RESULT_DIV.show();
          setTalk('おおゆうしゃよ、</br>' +
            'しんでしまうとはなさけない。。</br>');
          setTimeout(function () {
            alert('つづけるときはF５キーを押してね。');
          }, frameTime);
        },
        'clear': function () {
          SELECTOR.RESULT_DIV.show();
          setTalk('パーティーは勝利した！');
          setTimeout(function () {
            SELECTOR.BATTLESCENE.hide();
            $('#credits').show();
          }, frameTime);
        }
      }
    };
  })();
  
  window.audioPlay = function() {
    if (soundFlag) {
      SELECTOR.AUDIO_TAG[0].currentTime = 0;
      SELECTOR.AUDIO_TAG[0].play();
    }
  };

  window.playerFlag = (function() {
    var len  = 0,
        max  = 0,
        bits = 0;
    function count_bit(b) {
      b = (b & 0x55555555) + (b >> 1 & 0x55555555);
      b = (b & 0x33333333) + (b >> 2 & 0x33333333);
      b = (b & 0x0f0f0f0f) + (b >> 4 & 0x0f0f0f0f);
      b = (b & 0x00ff00ff) + (b >> 8 & 0x00ff00ff);
      return (b & 0x0000ffff) + (b >> 16 & 0x0000ffff);
    }
    return {
      init      :function (n) {
        bits =(1<<n)-1;
        len  =(max=n);
        return this;
      },
      isAllDeath:function() {
        return (bits===0);
      },
      arrivingAt: function(N) {
        if (len <= N || N < 0) return -1;
        for (i = 0; i < max; i = (i + 1)) {
          if (bits >>> i & 1) {
            N = (N - 1)|0;
            if (N === -1) {
              // console.log(i);
              return i;
            }
          }
        }
      },
      isDeath   : function(N) {
        return !(bits >>> N & 1);
      },
      death     : function(N) {
        len  = (!(bits>>>N&1))?len:len-1;
        bits = bits & ~(1 << N);
        return bits;
      },
      arrive    : function(N) {
        len  =(bits>>>N&1)?len:len+1;
        bits = bits|(1<<N);
        return bits;
      },
      bits:function () {
        return bits;
      },
      show:function () {
        return (bits).toString(2);
      },
      max:function () {
        return max;
      },
      first:function () {
        return count_bit((bits & (-bits))-1);
      },
      len:function () {
        return len;
      }
    };
  })();

  window.setTalk = function(txt) {
    if (txt !== '') {
      SELECTOR.RESULT.html(txt);
    }
  };
  
  var playerNext=function (cnt) {
    if(cnt===len(TYPE.PLAYER)) return -1;
    for(i=0;i<len(TYPE.PLAYER);i=(i+1)>>>0){
      if(Chr[at(TYPE.PLAYER,i)].canAttack()){
        // console.log(i+'番目');
        cnt=(cnt-1)|0;
        if(cnt<0){
          // console.log(i);
          return i;
        }
      }
    }
    return -1;
  };

  var command = (function () {
    var cnt = 0,
      idx = 0;
    return {
      magicNext: function (elem) {
        var text = elem.text();
        SELECTOR.ENEMY_STATUS.show();
        SELECTOR.MAGIC_LIST.hide();
        Chr[at(TYPE.PLAYER, idx)].AI(text);
        idx = playerNext((cnt = (cnt + 1)));
        if (idx === -1) {
          Chr[at(TYPE.ENEMY, enemyIndex)].AI();
          cnt = 0;
          changeDiv(0);
          return;
        }
        else {
          // SELECTOR.COMLIST.html(Chr[at(TYPE.PLAYER, idx)].comText);
          $('#commandDiv #name').html(Chr[at(TYPE.PLAYER, idx)].name);
        }
      },
      next: function (elem) {
        var text = elem.text();
        // console.log(idx);
        if ((elem.index() - 1) === COM_TYPE.MAGIC) {
          // console.log( Chr[at(TYPE.PLAYER,idx)].comText);
          SELECTOR.MAGIC_LIST.html(Chr[at(TYPE.PLAYER, idx)].comText);
          // console.log(SELECTOR.ENEMY_STATUS.text());
          SELECTOR.ENEMY_STATUS.hide();
          SELECTOR.MAGIC_LIST.show();
        }
        else {
          SELECTOR.ENEMY_STATUS.show();
          SELECTOR.MAGIC_LIST.hide();
          Chr[at(TYPE.PLAYER, idx)].AI(text);
          idx = playerNext((cnt = (cnt + 1)));
          if (idx === -1) {
            Chr[at(TYPE.ENEMY, enemyIndex)].AI();
            cnt = 0;
            changeDiv(0);
            return;
          }
          else {
            // SELECTOR.COMLIST.html(Chr[at(TYPE.PLAYER, idx)].comText);
            $('#commandDiv #name').html(Chr[at(TYPE.PLAYER, idx)].name);
          }
        }
      },
      first: function () {
        idx = playerNext(0);
        $('#commandDiv #name').html(Chr[at(TYPE.PLAYER, idx)].name);
      }
    };
  })();

  function changeDiv(n) {
    var it = Chr[n];
    if (n === 0) {
      SELECTOR.CHOOSE_DIV.hide();
      SELECTOR.RESULT_DIV.show();
    } else if (n === len(TYPE.MAX)) {
      for (i = 0; i < len(TYPE.MAX); i = (i + 1) | 0) {
        Chr[i].buffData.calc();
      }
      SELECTOR.RESULT_DIV.hide();
      SELECTOR.CHOOSE_DIV.show();
      command.first();
      return;
    }

    if (it.canAttack()) {
      setTalk(it.act());
      // console.log(it);
      if (it.target.isDeath()) {
        setTimeout(function() {
          var state= it.target.Deathact();
          if(state==='main'){
            setTimeout(function() {
              changeDiv(0 | (n + 1));
            }, frameTime);
          }
          else{
            setTimeout(gameScene.draw[state],frameTime);
          }

        }, frameTime);
      }
      else {
        setTimeout(function() {
          changeDiv(0 | (n + 1));
        }, frameTime);
      }
    }
    else {
      changeDiv((n + 1) | 0);
    }
  }

  /*jqueryの初期設定*/

  $.fn.changeShow = function(options) {
    var settings = $.extend({
      'show': 0,
      'hide': 1
    }, options);
    this.eq(settings.show).show();
    this.eq(settings.hide).hide();
    return this;
  };

  $('ul#menu')
    .on('mouseover', '.item',
      function() {
        $(this).addClass('select');
      })
    .on('mouseout', '.item',
      function() {
        $(this).removeClass('select');
      });

  $("#button").click(function() {
    // scene     = SCENE.BATTLE;
    gameScene.draw['main']();
  });

  $('#commandDiv ul')
    .on('mouseover', '.com',
      function() {
        $(this).addClass('select');
      })
    .on('mouseout', '.com',
      function() {
        $(this).removeClass('select');
      })
    .on('click', '.com',
      function() {
        command.next($(this));
      });
      
  $('#magicDiv ul')
    .on('mouseover', '.magic',
      function() {
        $(this).addClass('select');
      })
    .on('mouseout', '.magic',
      function() {
        $(this).removeClass('select');
      })
    .on('click', '.magic',
      function() {
        command.magicNext($(this));
      });

  window.len = function(type) {
    return (type == TYPE.MAX) ? begin[type] : begin[type + 1] - begin[type];
  };

  window.at = function(type, index) {
    return begin[type] + index;
  };

  $.getJSON('./asset/config.json')
    .done(function (json) {
      begin[TYPE.PLAYER] = 0;
      playerFlag.init(playerNum = begin[TYPE.ENEMY] = json[0].length);
      for (i = 0; i < begin[TYPE.ENEMY]; i = (i + 1) | 0) {
        Chr.push(new Player(json[0][i], i));
      }
      // imgs=json[2];
      // console.log(imgs);
      begin[TYPE.MAX] = begin[TYPE.ENEMY] + 1;
      Chr.push(new Enemy(json[1][0]));
      initflag = true;
      magic = json[2];
      $('#commandDiv #name').html(Chr[at(TYPE.PLAYER,0)].name);
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      console.error("エラー：" + textStatus);
      console.error("テキスト：" + jqXHR.responseText);
    });
  SELECTOR.WRRAPPER.show();
});
