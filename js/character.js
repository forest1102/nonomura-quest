$(function() {

  var FLAGS = {
      NAME: 1,
      HP  : 2,
      MP  : 4,
      COM : 8,
    },
    BUFF = {
      lowerAttack   : 0,
      lowerDefense  : 1,
      higherAttack  : 2,
      higherDefense : 3,
      angry         : 4,
      sleep         : 5,
      MAX_NUM       : 6
    },
    IMGTYPE = {
      'CRY'  : 0,
      'DRINK': 1
    };

  if (typeof Object.create !== 'function') {
    Object.create = function(o) {
      var F      = function() {};
      F.protoype = o;
      return new F();
    };
  }

  var probability=function (r) {
    var a=Math.random();
    // console.log('乱数:'+a);
    return (r >= a);
};

  /*クラス宣言*/
  window.buff = function(_type, _x, _turn) {
    this.type = _type;
    this.x    = _x;
    this.turn = _turn;
  };

  window.buffManager = function() {
    this.buffs      = new List();
    this.table      = 0;
    this.attack     = 0;
    this.defense    = 0;
    this.dexterity  = 0;
    this.evasion    = 0;
    this.canAttack  = true;
    this.updateFlag = 0;
    this.com        = [];
  };

  window.CommandAct = function(_elem) {
    this.me = _elem;
  };
  // キャラクタークラス
  window.Character = function(_type, _to, data) {

    this.to            = _to;

    this.hp            = data.hp || 0;
    
    this.maxhp         = data.hp ||0;

    this.updateFlag    = 0;

    this.mp            = data.mp || 0;
    
    this.maxMP         = data.mp||0;

    this.name          = data.name||'エラー';

    this.instance_name = data.instance_name||'empty';

    this.type          = _type;

    this.data          = data;

    this.prev          = this;

    this.com           = data.com||['なにもしない'];

    this.attack        = data.attack || 0;

    this.buffData      = new buffManager();

    this.comAct        = new CommandAct(this);

    this.defense       = data.defense||0;

    this.evasion       = data.EVA||0;

    this.dexterity     = data.DEX||0;

    this.sayFlag       = false;
    
    this.curCom        = 'noneAct';

    this.skillLen      = this.com.length;

    this.target        = null;

    this.init();

    this.prevHP        = $('.' + this.instance_name + ' #hp');
    this.prevName      = $('.' + this.instance_name + ' #name');
    this.prevMP        = $('.' + this.instance_name + ' #mp');
    this.prevAttack    = $('.' + this.instance_name + ' #attack');

    this.prevHP.text(this.hp);
    this.prevName.text(this.name);
    this.prevMP.text(this.mp);
    // console.log(this.evasion);
  };

  /*プレイヤークラス*/
  window.Player = function(data, i) {
    Character.call(this, TYPE.PLAYER, TYPE.ENEMY, data);
    this.index = i;
  };
  Player.prototype   = Object.create(Character.prototype);
  Player.constructor = Player;

  //エネミークラス*

  window.Enemy = function(data) {
    Character.call(this, TYPE.ENEMY, TYPE.PLAYER, data);
    this.job     = data.job;
    this.prevJob = $('.' + this.instance_name + ' #job');
    this.prevJob.text(this.job);
    // SELECTOR.ENEMYIMAGE.attr({'src':imgs[IMGTYPE.DEFAULT]});
    SELECTOR.ENEMYIMAGE.jrumble({
      x       : 10,
      y       : 10,
      rotation: 0,
      speed   : 10,
      // Min  : 1000
    });
  };

  Enemy.prototype   = Object.create(Character.prototype);
  Enemy.constructor = Enemy;


  // デバフ管理の初期設定
  buffManager.prototype.add = function() {
    var len = arguments.length;
    for (i = 0; i < len; i = (i + 1) | 0) {
      this.buffs.push(arguments[i]);

    }
  };
buffManager.prototype.calc = function() {
  this.attack = 0;
  this.defense = 0;
  this.canAttack=true;
  var prev = this;
  this.buffs.forEach(function(data, i) {
    if (data.turn > 0) {
      switch (data.type) {
        case BUFF.lowerAttack:
          prev.attack -= data.x;
          // alert(data.x+'攻撃力が下がります.');
          break;

        case BUFF.lowerDefense:
          prev.defense -= data.x;
          break;

        case BUFF.higherAttack:
          prev.attack += data.x;
          break;
          
        case BUFF.higherDefense:
          prev.defense += data.x;
          break;
        

        case BUFF.angry:
          prev.attack += data.x;
          prev.com = ['こうげき'];
          break;
        case BUFF.sleep:
          prev.canAttack = false;
          break;

        default:
          alert('エラーーーー！');
          break;

      }
      data.turn = (data.turn - 1) | 0;
    } else {
      prev.buffs.remove(i);
    }
  });
};

  /*キャラクターの初期設定*/

  CommandAct.prototype = {
    'attack': function(target,magic) {
      // console.log(this.me.DEX()*(1-target.EVA()));
      if(probability(this.me.DEX()*(1-target.EVA())*magic.rate)){
        var point   = 0;
        point       = more0(this.me.ATK() - target.DEF());
        target.hp   -= point;
        target.hp   = more0(target.hp);
        target.updateFlag |= FLAGS.HP;
        return (this.me.name + 'のこうげき！<br>' +
          target.name + 'は' + point + 'のダメージをうけた！');
      }
      else{
        // console.log('外した。');
        return (this.me.name + 'のこうげき！<br>'+
                'しかし外してしまった！');
      }
    },
    'defense':function (magic) {
      
    },
    'heal': function(magic) {
      var pHP=this.me.hp;
      this.me.hp         += magic.point;
      if(this.me.hp>this.me.maxhp) this.me.hp=this.me.maxhp;
      this.me.updateFlag |= FLAGS.HP;
      return (this.me.name  + 'はかいふくをつかった！<br>' +
        this.me.name + 'は' + (this.me.hp-pHP) + 'かいふくした！');
    },
    'noneAct': function() {
      return (this.me.name + 'はなにもしなかった！');
    },
    'cry': function(target,magic) {},
    'boost': function(magic) {
      var self      = this.me;
      self.attack   += magic.point;
      self.mp       -=magic.money;
      self.updateFlag |=FLAGS.MP;
      return (self.name + 'は'+magic.money+'使って強化した。</br>'
            +'こうげきりょくが' + magic.point + '上がった！  ');
    },
    'bribe':function (target,magic) {
      var self = this.me;
      if (probability(this.me.DEX() * (1 - target.EVA()) * magic.rate)) {
        target.buffData.add(new buff(BUFF.sleep, 0, magic.turn));
        return (self.name + 'はお金を渡した</br>' +
              target.name + 'は次のターンは攻撃できない。');
      }
      else{
        return(self.name+'はお金を渡した</br>'+
             'しかし、'+target.name+'にはこうかがなかった！');
      }
    },
    'flash':function (target,magic) {
      var self = this.me;
      if (probability(this.me.DEX() * (1 - target.EVA()) * magic.rate)) {
        target.buffData.add(new buff(BUFF.sleep, 0, magic.turn));
        return (self.name + 'はカメラでフラッシュをたいた!</br>' +
              target.name + 'は次のターンは攻撃できない。');
      }
      else{
        return(self.name+'はカメラでフラッシュをたいた!</br>'+
             'しかし、'+target.name+'にはこうかがなかった！');
      }
    }
  };

  var more0 = function(x) {
    return ((x <= 0) ? 0 : x);
  };

  Character.prototype.toEnglish = {
    'こうげき'    : 'attack',
    'かいふく'    : 'heal',
    'なにもしない': 'noneAct',
    'なきさけぶ'  : 'cry',
    'ぶーすと'    : 'boost',
    'ちょうはつ'  : 'taunt',
    'わいろ'      : 'bribe',
    'まほう'      : 'magic',
    'フラッシュ'  : 'flash'
  };

  Character.prototype.ATK = function() {
    return more0(this.attack + this.buffData.attack);
  };

  Character.prototype.DEF = function() {
    return more0(this.defense + this.buffData.defense);
  };

  Character.prototype.DEX = function () {
    return more0(this.dexterity+this.buffData.dexterity);
  };

  Character.prototype.EVA=function () {
    return more0(this.evasion+this.buffData.evasion);
  };

  Character.prototype.canAttack = function () {
    return ((!this.isDeath())&&this.buffData.canAttack);
  };

  Character.prototype.Deathact = function() {
    if (!this.sayFlag) {
      console.log(this.name + 'は死んでしまった！');
      playerFlag.death(this.index);
      this.sayFlag = true;
    }
  };

  Character.prototype.update = function() {
    if ((this.updateFlag & FLAGS.HP)) {
      this.prevHP.text(this.hp);
      // console.log(this.name+'は'+'HPが'+this.hp+'になった！');
    }
    if(this.updateFlag&FLAGS.MP){
      this.prevMP.text(this.mp);
    }

    this.updateFlag = 0;
  };

  Character.prototype.isDeath = function() {
    return (this.hp <= 0);
  };

  Character.prototype.act = function() {
    // var point = 0;
    var text = '',
        command=this.curCom,
        curMagic=magic[command];
    switch (curMagic.type) {
      case 'single':
        switch (curMagic.target) {
          case 'me':
            this.target=this.prev;
            text=this.comAct[command](curMagic);
            this.update();
          break;
          case 'you':
            this.target = Chr[at(this.to, this.indexNum())];
            text = this.comAct[command](this.target,curMagic);
            if (this.updateFlag !== 0) {
              this.update();
            }
            if (this.target.updateFlag !== 0) {
              this.target.update();
            }
          break;
          case 'none':
            this.target=this.prev;
            text=this.comAct[command]();
            break;
          default:
            console.error(command+'は攻撃対象が選ばれていません。');
        }
      break;

      case 'multi':
        console.log('全体攻撃します。');
      break;

      default:
        console.error(command+'は攻撃範囲が定まっていません。');
    }
    // console.log(this.target);
    
    this.curCom='noneAct';
    return text + '<br>';
  };
  
  Character.prototype.AI=function (text) {
    this.curCom=this.toEnglish[text];
  };

  /*プレイヤーの初期設定*/

  // Player.prototype.reinit = function() {
  //   this.prev = new Player(this.data);
  // };

  Player.prototype.indexNum = function() {
    return enemyIndex;
  };

  Player.prototype.init = function() {
    // this.toEnglish['うおおおおお']='boost';
    if (!initflag) {
      var c = '';
      for (var i = 0, max = this.com.length; i < max; i = 0 | (i + 1)) {
        // var c = $('<li>').text(this.com[i]).attr('id','com');
        c += '<li class="magic">' + this.com[i] + '</li>';
      }
      this.comText = c;
      SELECTOR.STATUS_DIV.append(
        '<table class="' + this.instance_name + ' frame">' +
          '<tbody>' +
            '<tr><th colspan="2" id="name"></th></tr>' +
            '<tr><td class="key">H</td><td class="value" id="hp"></td></tr>' +
            '<tr class="showMP"><td class="key">気力</td><td class="value" id="mp"></td></tr>' +
          '</tbody>' +
        '</table>'
      );
      // $('#commandDiv ul').append(c);
    }
  };

  Player.prototype.Deathact = function() {
    var text = '';
    if (!this.sayFlag) {
      // len[TYPE.MAX]=(len[TYPE.MAX]-1)|0;
      $('table.'+this.instance_name).addClass('death');
      text = (this.name + 'はしんでしまった！');
      setTalk(text);
      playerFlag.death(this.index);
      // console.log(playerFlag.show()+'になった');
      if (playerFlag.isAllDeath()) {
        endFlag=true;
        return 'over';
      }
      this.sayFlag = true;
    }
    return 'main';
  };

  //エネミーの初期設定

  // Enemy.prototype.reinit = function() {
  //   this.prev = new Enemy(this.data);
  // };

  Enemy.prototype.indexNum = function() {
    var r = Math.floor(Math.random() * playerFlag.max());
    while (playerFlag.isDeath(r)) {
      r = Math.floor(Math.random() * playerFlag.max());
    }
    // console.log('攻撃対象: '+Chr[r].name);
    return r;
  };
  
  Enemy.prototype.AI = function () {
    this.curCom=this.toEnglish[this.com[Math.floor(Math.random() * (this.skillLen))]];
  };
  
  Enemy.prototype.init = function() {
    this.toEnglish['みずをのむ'] = 'heal';

    SELECTOR.ENEMY_STATUS.append(
      '<ul class="frame ' + this.instance_name + '">' +
          '<li id="name"></li>' +
          '<li id="job"></li>' +
          '<li>1匹</li>' +
      '</ul>');

    this.comAct.cry = function(target,magic) {
      // console.log('crying');
      audioPlay();
      SELECTOR.ENEMYIMAGE.trigger('startRumble');
      setTimeout(function() {
        SELECTOR.ENEMYIMAGE.trigger('stopRumble');
      }, frameTime);
      if (probability(this.me.DEX()*(1-target.EVA())*magic.rate)) {
        var self  = this.me;
        target.buffData.add(new buff(BUFF.lowerAttack, magic.point, magic.turn));
        return (this.me.name + 'はなきさけんだ！</br>' + target.name + 'は' +
          magic.turn + 'ターンのあいだこうげきりょくが' + magic.point + 'さがる！');
      }
      else {
        return (this.me.name+'はなきさけんだ！</br>'+
                target.name+'にはこうかがなかった！');
      }
    };
    this.comAct.heal = function(magic) {
      this.me.hp += magic.point;
      this.me.updateFlag |= FLAGS.HP;
      // SELECTOR.ENEMYIMAGE.attr({'src':imgs[IMGTYPE.HEAL]});
      SELECTOR.ENEMYIMAGE.changeShow({
        'show': IMGTYPE.DRINK,
        'hide': IMGTYPE.CRY
      });
      setTimeout(function() {
        // SELECTOR.ENEMYIMAGE.attr({'src':imgs[IMGTYPE.DEFAULT]});
        SELECTOR.ENEMYIMAGE.changeShow({
          'show': IMGTYPE.CRY,
          'hide': IMGTYPE.DRINK
        });
      }, frameTime);
      return (this.me.name + 'みずをのんだ！<br>' +
        this.me.name + 'は' + magic.point + 'かいふくした！');
    };
  };

  Enemy.prototype.Deathact = function () {
    console.log(this.name + 'は死にました');
    var text = (this.name + 'をたおした！');
    setTalk(text);
    endFlag = true;
    return 'clear';
  };
});
