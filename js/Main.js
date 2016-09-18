/*global $ len TYPE Player Enemy SCENE SELECTOR setTalk frameTime Chr*/
$(function() {
  var i=0;

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
    'GAMEOVERSCENE': $('#gameoverScene')
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

  window.gameScene=(function () {
    var  draw={
      'title':(function () {
        SELECTOR.BATTLESCENE.hide();
        SELECTOR.TITLESCENE.show();
      })(),
      'main':function () {
        SELECTOR.TITLESCENE.hide();
        SELECTOR.BATTLESCENE.show();
        soundFlag = confirm('音を出しますか？') || false;
      },
      'over':function () {
        SELECTOR.RESULT_DIV.show();
        setTalk('おおゆうしゃよ、</br>' +
          'しんでしまうとはなさけない。。</br>');
        setTimeout(function() {
          alert('つづけるときはF５キーを押してね。');
        }, frameTime);
      },
      'clear':function () {
        SELECTOR.RESULT_DIV.show();
        setTalk('パーティーは勝利した！');
        setTimeout(function() {
          endRoll();
        }, frameTime);
      }
    };
    return{
      'draw': draw
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

  var endRoll=function () {

  };

  var command = (function() {
    var cnt = 0,
        idx =0;
    return {
      next: function(elem) {
    var num = elem.index() - 1;
    Chr[at(TYPE.PLAYER, idx)].num = num;
    idx = playerFlag.arrivingAt((cnt = (cnt + 1) >>> 0));
    if (idx === -1) {
      // alert("コマンド入力完了！！");
      Chr[at(TYPE.ENEMY, enemyIndex)].num = Math.floor(Math.random() * (Chr[at(TYPE.ENEMY, 0)].skillLen));
      cnt = 0;
      changeDiv(0);
      return;
    } else {
      // console.log('次は'+idx+'番目のターン');
      SELECTOR.COMLIST.html(Chr[at(TYPE.PLAYER, idx)].comText);
    }
  },
  first: function() {
    idx = playerFlag.arrivingAt(0);
    SELECTOR.COMLIST.html(Chr[at(TYPE.PLAYER, idx)].comText);
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

    if (!it.isDeath()) {
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
            gameScene.draw[state];
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

  $('ul#menu li')
    .mouseover(function() {
      $(this).addClass('select');
    })
    .mouseout(function() {
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

  window.len = function(type) {
    return (type == TYPE.MAX) ? begin[type] : begin[type + 1] - begin[type];
  };

  window.at = function(type, index) {
    return begin[type] + index;
  };

  $.getJSON('../asset/config.json')
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
      SELECTOR.COMLIST.html(Chr[at(TYPE.PLAYER, 0)].comText);
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      console.log("エラー：" + textStatus);
      console.log("テキスト：" + jqXHR.responseText);
    });
  SELECTOR.WRRAPPER.show();
});
