/* This is a static version of the puzzle that ran during hunt, to reduce
 * server costs.
 *
 * WARNING: PROCEEDING ANY FURTHER WILL SPOIL THE PUZZLE.
 *
 * YOU HAVE BEEN WARNED!
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */


$(document).ready(function() {

    var ORDERING = [4, 5, 2, 1, 6, 3];
    var COL_SUMS = [0, 9, 9, 3, 12, 0];
    var ROW_SUMS = [0, 6, 0, 6, 13, 8];
    var SIZE = 6;

  function col_entries(grid, j) {
    var out = [];
    var count = 0;
    for (var i = 0; i < SIZE; i++) {
        if (grid[i][j]) {
            out[count++] = ORDERING[i];
        }
    }
    return out;
  }

  function row_entries(grid, i) {
    var out = [];
    var count = 0;
    for (var j = 0; j < SIZE; j++) {
        if (grid[i][j]) {
            out[count++] = ORDERING[j];
        }
    }
    return out;
  }

  function col_sum(grid, j) {
    var total = 0;
    for (var i = 0; i < SIZE; i++) {
        if (grid[i][j]) {
            total += ORDERING[i];
        }
    }
    return total;
  }

  function row_sum(grid, i) {
    var total = 0;
    for (var j = 0; j < SIZE; j++) {
        if (grid[i][j]) {
            total += ORDERING[j];
        }
    }
    return total;
  }

  function image(number) {
      var IMG_CONSTANTS = [
        'f899139d',
        '38b3eff8',
        'ec895663',
        '6974ce5a',
        'c9e1074f',
        '65b9eea6',
        'f0935e4c',
        'a97da629',
        'a3c65c29',
        '2723d092',
        '5f93f983',
        '698d51a1',
        '7f6ffaa6',
        '73278a4a',
        '5fd0b37c',
        '2b44928a',
        'c45147de',
        'eb160de1',
        '5ef05993',
        '07e1cd7d',
        'da4fb5c6',
        '4c56ff4c'];
      var out = ['<img src="/puzzle_resources/anthropology/', IMG_CONSTANTS[number], '.png" height=80>']
      return out.join("");
  }

  function audio_filename(number) {
      // note: num = 1 to 8, use constants 0 to 8 to make indexing easy.
      var AUDIO_CONSTANTS = [
        '3644a684',
        '757b505c',
        '854d6fae',
        'e2c0be24',
        '274ad478',
        'eae27d77',
        '7eabe3a1',
        '69adc1e1',
        '091d584f'];
      return AUDIO_CONSTANTS[number];
  }


  function check_grid(){
    var grid = {};
    for (var i = 0; i < 6; i++) {
        grid[i] = {};
        for (var j = 0; j < 6; j++) {
            element = $('#' + i.toString() + j.toString() + 'cell').hasClass("b");
            grid[i][j] = element;
        }
    }
    // Display loading message before post in case it's slow.
    receiveMessages('Processing grid...');
    // Add a small delay to make it scan better.
    setTimeout(function() {
        var correct = false;
        var id_to_update = 'none';
        // Check row then column
        var message = '<p><strong>Connection established! Click received signs to play transmission. Refresh the page to restart from the beginning.</strong></p>';
        var id_to_update = 'failure';
        for (var c = 0; c < 2 * SIZE; c++) {
            if (c + 1 <= 6) {
                var actual = row_sum(grid, c)
                if (actual !== ROW_SUMS[c]) {
                    var entries = row_entries(grid, c);
                    var entry_images = [];
                    for (var index = 0; index < entries.length; index++) {
                        entry_images[index] = image(entries[index]);
                    }
                    message = [
                        '<strong>ERROR: SUM(', entry_images.join(', '), ') = ', image(actual), '</strong>'];
                    id_to_update = 'c' + (c+1);
                    break;
                }
            } else {
                var column = 5 - (c - 6);
                var actual = col_sum(grid, column);
                if (actual !== COL_SUMS[column]) {
                    var entries = col_entries(grid, column);
                    var entry_images = [];
                    for (var index = 0; index < entries.length; index++) {
                        entry_images[index] = image(entries[index]);
                    }
                    message = [
                        '<strong>ERROR: SUM(', entry_images.join(', '), ') = ', image(actual), '</strong>'];
                    id_to_update = 'c' + (c+1);
                    break;
                }
            }
        }
        receiveMessages(message);
        if (id_to_update !== 'failure') {
            // something wrong, color.
            colorConstraint(id_to_update);
        } else {
            // correct, set up phase 2.
            clearCellColor();
            clearConstraintColor();
            setup_phase2();
        }
    }, 100);
  }

  function turnOnCheck() {
      $('#checkbutton').unbind('click');
      $('#checkbutton').click(function() {
        check_grid();
      });
  }

  turnOnCheck();

  function assignClickHandlers() {
    for (var i = 0; i < 6; i++) {
        for (var j = 0; j < 6; j++) {
            $('#' + i.toString() + j.toString() + 'cell').click(
                function() {
                    $(this).toggleClass("w b");
                }
            );
        }
    }
  }

  assignClickHandlers();

  function makeClickHandler(filename) {
    return function () {
        clearCellColor();
        $(this).parent().css("background", "lightgreen");
        retrieve_clue(filename);
    };
  }

  function clearClickHandlers() {
    for (var i = 0; i < 6; i++) {
        for (var j = 0; j < 6; j++) {
            $('#' + i.toString() + j.toString() + 'cell').unbind('click');
        }
    }
  }

  function prepare_phase2() {
    // Builds HTML we want for phase 2.
    // List of cell -> audio filenames.
    // 56 66 26 61 13 23 53 65
    // goes to
    // 25 55 35 54 46 36 26 52
    // then subtract 1 and transpose
    // 41 44 42 34 53 52 51 14
    var ids = [
        "41cell",
        "44cell",
        "42cell",
        "34cell",
        "53cell",
        "52cell",
        "51cell",
        "14cell"];
    var images = [
        image(1),
        image(2),
        image(3),
        image(4),
        image(5),
        image(6),
        image(7),
        image(8)];
    var filenames = [
        audio_filename(1),
        audio_filename(2),
        audio_filename(3),
        audio_filename(4),
        audio_filename(5),
        audio_filename(6),
        audio_filename(7),
        audio_filename(8)];
    return {'ids': ids, 'images': images, 'filenames': filenames, 'extra': '<p>Lyra starts cackling. "See? I told you!"</p><p>"You\'re certainly picking up something. Strange. This all sounds so familiar."</p>'};
  }

  function setup_phase2() {
    clearClickHandlers();
    var response = prepare_phase2();
    receiveExtra(response['extra']);
    $('#checkbutton').remove();
    for (var i = 0; i < response['ids'].length; i++) {
        var id_ = response['ids'][i];
        var img = response['images'][i];
        var filename = response['filenames'][i];
        $('#' + id_).html(img);
        $('#' + id_).children().first().click(makeClickHandler(filename));
    }
  }

  function retrieve_lyra_clue(filename) {
    var message = '<audio controls="controls" src="/puzzle_resources/anthropology/' + filename + '.mp3">This puzzle requires support of the audio HTML element.</audio>';
    if (filename == '69adc1e1') {
        // Lena hall clue, make sure to request stage name.
        message += '<p>(stage name)</p>';
    }
    if (filename == '854d6fae') {
        // Emily blunt clue, make sure to request villain name
        message += '<p>(villain name)</p>';
    }
    return message;
  }

  function retrieve_clue(filename) {
    var message = retrieve_lyra_clue(filename);
    receiveClue(message);
  }

  function receiveMessages(message) {
      $("#reply").html(message);
  }

  function receiveExtra(message) {
      $("#extra").html(message);
  }

  function receiveClue(message) {
      $("#clue").html(message);
  }

  function clearConstraintColor() {
    // constraints
    ids = [ "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "c10", "c11", "c12" ];
    for (var i = 0; i < 12; i++) {
        $('#' + ids[i]).css("background", "white");
    }
  }

  function clearCellColor() {
    // cells
    for (var i = 0; i < 6; i++) {
        for (var j = 0; j < 6; j++) {
            $('#' + i.toString() + j.toString() + 'cell').css(
                "background","white");
        }
    }
  }

  function colorConstraint(id_to_update) {
    clearConstraintColor();
    $('#' + id_to_update).css("background", "lightcoral");
  }
  function colorCell(id_to_update) {
    clearCellColor();
    $('#' + id_to_update).css("background", "lightcoral");
  }
});
