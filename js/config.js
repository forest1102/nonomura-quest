$(function () {
  window.json=[
    [
      {
        "name"         : "きしゃA",
        "instance_name": "kisyaA",
        "hp"           : 400,
        "mp"           : 80,
        "attack"       : 50,
        "defense"      : 10,
        "DEX"          : 0.9,
        "EVA"          : 0.1,
        "com"          : ["こうげき", "かいふく", "なにもしない"]
      },
      {
        "name"         : "きしゃB",
        "instance_name":"kisyaB",
        "hp"           : 400,
        "mp"           : 80,
        "attack"       : 50,
        "defense"      : 10,
        "DEX"          : 0.9,
        "EVA"          : 0.1,
        "com"          : ["こうげき", "かいふく", "ぶーすと"]
      },
      {
        "name"         : "きしゃC",
        "instance_name": "kisyaC",
        "hp"           : 400,
        "mp"           : 80,
        "attack"       : 50,
        "defense"      : 10,
        "DEX"          : 0.9,
        "EVA"          : 0.1,
        "com"          : ["こうげき", "かいふく", "ぶーすと"]
      }
    ],

    [
      {
        "name"         : "ののむら",
        "instance_name": "nonomura",
        "hp"           : 3000,
        "mp"           : 300,
        "attack"       : 50,
        "defense"      : 20,
        "DEX"          : 0.9,
        "EVA"          : 0.1,
        "com"          : ["みずをのむ", "こうげき", "なきさけぶ"],
        "job"          : "もとぎいん"
      }
    ],
    {
      "heal": {
        "target": "me",
        "type"  : "single",
        "rate"  : 1.0,
        "point" : 20
      },
      "noneAct": {
        "target": "none",
        "type"  : "single",
        "rate"  : 1.0
      },
      "boost": {
        "target": "me",
        "type"  : "single",
        "rate"  : 1.0,
        "point" : 20,
        "money" : 2
      },

      "attack": {
        "target": "you",
        "type"  : "single",
        "rate"  : 1.0
      },
      "cry"   : {
        "target": "you",
        "type"  : "single",
        "rate"  : 0.7,
        "turn"  : 2,
        "point" : 20
      },
      "bribe": {
        "target": "you",
        "type"  : "single",
        "rate"  : 0.5,
        "turn"  : 1,
      },
      "taunt": {
        "target": "you",
        "type"  : "single",
        "rate"  : 0.6
      }

    }
  ];

});
