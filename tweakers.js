var tweak = (function() {
  var $ = document.querySelector.bind(document);
  var create = document.createElement.bind(document);
  var tweakers;

  function createSpinner(name, initial, cb) {
    var label = create('label');
    var input = create('input');
    label.textContent = name;
    label.className = 'ValueTweaker';
    input.type = 'number';
    input.value = initial;
    input.addEventListener('change', function() {
      var value = parseFloat(this.value);
      cb(value);
    });
    label.appendChild(input);
    tweakers.appendChild(label);
  }

  function createButton(name, cb) {
    var button = create('button');
    button.textContent = name;
    button.addEventListener('click', cb);
    tweakers.appendChild(button);
  }

  function tweak() {
    tweakers = create('div');
    tweakers.className = 'Tweakers';
    document.body.appendChild(tweakers);

    createSpinner('Gravity', GRAVITY, function(value) {
      game.physics.arcade.gravity.y = value;
    });

    createSpinner('Jump Velocity', JUMPVELOCITY, function(value) {
      JUMPVELOCITY = value;
    });

    createSpinner('Boost Velocity', BOOSTVELOCITY, function(value) {
      BOOSTVELOCITY = value;
    });

    createSpinner('Run Start Speed', RUNSTARTSPEED, function(value) {
      RUNSTARTSPEED = value;
    });

    createSpinner('Run Full Speed', RUNFULLSPEED, function(value) {
      RUNFULLSPEED = value;
    });

    createSpinner('Velocity Damping', VELOCITYDAMPING, function(value) {
      VELOCITYDAMPING = value;
    });

    createSpinner('Max Boosts', MAXBOOSTS, function(value) {
      MAXBOOSTS = value;
    });

    createButton('Reset Position', function() {
      player.x = 128;
      player.y = 768;
    });
  }

  return tweak;
}());
