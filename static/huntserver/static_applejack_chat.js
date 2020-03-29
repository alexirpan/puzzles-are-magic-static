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
    var HELP = 0;
    var PLAY = 1;
    var PLAY_INSERT = 2;
    var EXAM = 3;
    var EXAM_REPLY = 4;
    var INVALID = 5;
    var EXAM_PARSE_ERROR = 6;

    var HELP_MESSAGE = [
        'Valid commands:',
        '',
        'help: Print a help message.',
        'play: Play a round of Applejacks to Applejacks.',
        'finalexam: Take your final exam.'].join('\n');

    function parse(raw_data) {
        var output = {};
        var category = '';
        var lines = raw_data.split('\n');
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (line.trim() == '') {
                continue;
            }
            if (line.startsWith('\t')) {
                output[category].push(line.trim());
            } else {
                var new_category = [];
                var category_name = line.trim();
                for (var k = 0; k < category_name.length; k++) {
                    var c = category_name[k];
                    if (c === ' ') {
                        new_category.push(c);
                    } else {
                        new_category.push('?');
                    }
                }
                category = new_category.join('');
                output[category] = [];
            }
        }
        return output;
    }

    var raw_card_data = [
'Appleloosa Ponies',
'	TROUBLE SHOES',
'	BLOOMBERG',
'	SHERIFF SILVERSTAR',
'	CHIEF THUNDERHOOVES',
'	LITTLE STRONGHEART',
'	STAR SPUR',
'	FETTER KEYS',
'Japanese Mountains',
'	KITA',
'	HOTAKADAKE',
'	AINO',
'	YARI',
'	WARUSAWA',
'	AKAISHI',
'	ONTAKE',
'Audio Manufacturers',
'	MARANTZ',
'	CAMBRIDGE',
'	EMOTIVA',
'	NAIM',
'	REGA',
'	ONKYO',
'	PEACHTREE',
'Music Genres',
'	CLASSICAL',
'	BLUES',
'	POLKA',
'	METAL',
'	TECHNO',
'	COUNTRY',
'	REGGAE',
'Mike Doughty Albums',
'	THE GAMBLER',
'	BUSKING',
'	SKITTISH',
'	THE QUESTION JAR SHOW',
'	ROCKITY ROLL',
'	DUBIOUS LUXURY',
'	WATER AND WASHINGTON'].join('\n');

    var raw_apple_data = [
'Appleloosa Ponies',
'	BRAEBURN',
'Japanese Mountains',
'	FUJI',
'Audio Manufacturers',
'	MCINTOSH',
'Music Genres',
'	JAZZ',
'Mike Doughty Albums',
'	GOLDEN DELICIOUS'].join('\n');

    var CARDS = parse(raw_card_data);
    var APPLES = [];

    var parsed_apples = parse(raw_apple_data);
    for (var cat in parsed_apples) {
        APPLES.push.apply(APPLES, parsed_apples[cat]);
    }

    var greens = [];
    var reds = [];
    for (var cat in CARDS) {
        greens.push(cat);
        reds.push.apply(reds, CARDS[cat]);
    }

    // starting order.
    var ORDER = ['Applejack', 'Twilight Sparkle', 'Rainbow Dash', 'Fluttershy', 'Rarity', 'Pinkie Pie'];

    var letters = 'abcdefghijklmnopqrstuvwxyz';

    function shuffle(cards) {
        // returns copy of given list, shuffled.
        var ret = cards.slice();
        shuffle_in_place(ret)
        return ret;
    }

    function shuffle_in_place(a) {
        // from stackoverflow.
        var j, x, i;
        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = a[i];
            a[i] = a[j];
            a[j] = x;
        }
        return a;
    }

    // init session
    var session = {
        'last_did_exam': false,
        'red_deck': shuffle(reds),
        'red_discard': [],
        'green_deck': shuffle(greens),
        'green_discard': [],
        'judges': ORDER.slice()};

    function clean_text(text) {
        // Remove all invalid characters and extra spaces.
        var text = text.toLowerCase();
        var cleaned = [];
        var count = 0;
        for (var i = 0; i < text.length; i++) {
            var c = text[i];
            if ((letters + ' ,').includes(c)) {
                cleaned[count++] = c;
            }
        }
        cleaned = cleaned.join('');
        cleaned = cleaned.trim();
        // split by space, remove empty strings, merge back should remove extra spaces.
        var words = cleaned.split(' ');
        var count = 0;
        var nonempty = [];
        for (var i = 0; i < words.length; i++) {
            if (words[i] !== '') {
                nonempty[count++] = words[i];
            }
        }
        return nonempty.join(' ');
    }

    function parse_message(text) {
        // clean message
        var text = clean_text(text);
        // Exam checks take priority
        // Only provide the parse error if they last typed "finalexam" and then enter
        // something in the wrong format.
        // Exam checks take priority.
        var guesses = text.split(',');
        var guesses = guesses.map(x => clean_text(x).toUpperCase());
        if (guesses.length == 6) {
            // Check the exam.
            return [EXAM_REPLY, guesses];
        }
        if (session['last_did_exam'] && guesses.length != 6) {
            // Tell them the parsing is wrong.
            return [EXAM_PARSE_ERROR, ''];
        }
        if (text == 'help') {
            return [HELP, ''];
        }
        if (text == 'play') {
            return [PLAY, ''];
        }
        if (text == 'finalexam') {
            return [EXAM, ''];
        }
        return [INVALID, ''];
    }

    function getRandomSubarray(arr, size) {
        // more stackoverflow code
        var shuffled = arr.slice(0), i = arr.length, temp, index;
        while (i--) {
            index = Math.floor((i + 1) * Math.random());
            temp = shuffled[index];
            shuffled[index] = shuffled[i];
            shuffled[i] = temp;
        }
        return shuffled.slice(0, size);
    }

    function deal(deck, discard, n=5) {
        // Deals N cards.
        // If we hit the end, reshuffle the rest and continue dealing.
        // Return whether we shuffled or not to indicate to the solver what
        // happened.
        if (deck.length >= n) {
            var picked = getRandomSubarray(deck, n);
            for (var i = 0; i < picked.length; i++) {
                var card = picked[i];
                deck.splice(deck.indexOf(card), 1);
                discard.push(card);
            }
            var output = {'cards': picked, 'shuffled': false, 'deck': deck, 'discard': discard};
            if (deck.length == 0) {
                // Shuffle as soon as we hit 0 cards.
                var deck = discard.slice();
                var discard = [];
                output['shuffled'] = true;
                output['deck'] = deck;
                output['discard'] = discard;
            }
            return output;
        } else {
            var partial = deck.slice();
            var rest = getRandomSubarray(discard, n - partial.length);
            for (var i = 0; i < rest.length; i++) {
                card = rest[i];
                discard.splice(discard.indexOf(card), 1);
            }
            var picked = [];
            picked.push.apply(picked, partial);
            picked.push.apply(picked, rest);
            var deck = discard.slice();
            var discard = picked.slice();
            return {'cards': picked, 'shuffled': true, 'deck': deck, 'discard': discard};
        }
    }

    function render_message(command, returned_message) {
        var output = [];
        output.push('<div class="message"><strong>' + command + '</strong></div>');
        output.push('<div class="message">' + returned_message.replace(/\n/g, '<br>') + '</div>');
        return output.join('\n');
    }

  $("#chatcontainer").scrollTop($("#chatcontainer")[0].scrollHeight);

  function is_visible(){
    var stateKey, keys = {
      hidden: "visibilitychange",
      webkitHidden: "webkitvisibilitychange",
      mozHidden: "mozvisibilitychange",
      msHidden: "msvisibilitychange"
    };
    for (stateKey in keys) {
      if (stateKey in document) {
        return !document[stateKey];
      }
    }
    return true;
  }

  function send_message(){
    var text = $('#messagebox').val();
    var parsed_type = parse_message(text);
    var message_type = parsed_type[0];
    var extra = parsed_type[1];
    session['last_did_exam'] = false;
    var cards = [];
    var returned_message;
    if (message_type == HELP) {
        returned_message = HELP_MESSAGE;
    } else if (message_type == PLAY) {
        var game_reply = play_game();
        returned_message = game_reply[0];
        cards = game_reply[1];
    } else if (message_type == EXAM) {
        returned_message = do_exam();
    } else if (message_type == EXAM_REPLY) {
        returned_message = verify_exam(extra);
    } else if (message_type == EXAM_PARSE_ERROR) {
        returned_message = 'Didn\'t understand your exam reply. Did you enter 6 cards separated by commas?';
    } else if (message_type == INVALID) {
        returned_message = "Sorry, I didn't understand that.";
    }

    // reply with prompt to show what was processed
    var command = '> ' + clean_text(text);

    // Make sure it ends in 2 newlines.
    while (returned_message.slice(-2) != '\n\n') {
        returned_message = returned_message + '\n';
    }
    // The whole message_dict format is for ajax/template uniformity
    var rendered_message = render_message(command, returned_message);
    receiveMessages(rendered_message);
    $('#messagebox').val('');
    $('#announce_checkbox').prop('checked', false);
  }

  $('#sendbutton').click(function() {
    send_message();
  });
  $(document).on("keypress", "#messagebox", function(e) {
    // send message on pressing Enter.
    if (e.which == 13) {
      send_message();
    }
  });

  function receiveMessages(message) {
      $("#chatcontainer").append(message);
      $("#chatcontainer").scrollTop($("#chatcontainer")[0].scrollHeight);
  }

  function winners(reds_picked) {
    var ponies = {
        'Applejack': applejack,
        'Twilight Sparkle': twilight_sparkle,
        'Rainbow Dash': rainbow_dash,
        'Fluttershy': fluttershy,
        'Rarity': rarity,
        'Pinkie Pie': pinkie_pie};
    var answers = {};
    for (var i = 0; i < ORDER.length; i++) {
        var name = ORDER[i];
        answers[name] = ponies[name](reds_picked);
    }
    return answers;
  }

  function list_cards(cards) {
    if (cards.length == 1) {
        return cards[0];
    }
    if (cards.length == 2) {
        return cards[0] + ' and ' + cards[1];
    }
    return cards.slice(0, -1).join(', ') + ', and ' + cards[cards.length-1];
  }

  function play_game() {
    var green_return = deal(session['green_deck'], session['green_discard'], n=1);
    var red_return = deal(session['red_deck'], session['red_discard'], n=5);
    // Adjust deck and discard before I forget.
    session['green_deck'] = green_return['deck'];
    session['green_discard'] = green_return['discard'];
    session['red_deck'] = red_return['deck'];
    session['red_discard'] = red_return['discard'];

    var green_card = green_return['cards'][0];
    var reds_picked = red_return['cards'];
    var answers = winners(reds_picked);

    var curr_judge = session['judges'][0];
    var lines = [];
    lines.push(curr_judge + ' turns over a green card. "The green card is...' + green_card + '."');
    lines.push('Every other pony hands over a red card.');
    lines.push(curr_judge + ' takes the red cards, then deals them face up. "The options are ' + list_cards(reds_picked) + '."');
    lines.push('');

    // Bad hack to get this to persist across calls to pony_report
    // call pony_report with judge=True to set this first.
    var chosen = [''];

    function pony_report(pony, judge=false) {
        var exclamations = ['Come on!', 'Really?', 'Interesting.'];
        if (judge) {
            // Choose the answer ahead of time for reporting.
            chosen[0] = answers[pony][Math.floor(Math.random() * answers[pony].length)];
        }
        if (judge) {
            var leadin = 'After considering the options, ' + pony + ' says, "I\'m picking';
        } else if (answers[pony].includes(chosen[0])) {
            var leadin = pony + ' says, "If I were judging, I\'d pick';
        } else {
            var exclaim = exclamations[Math.floor(Math.random() * exclamations.length)];
            var leadin = pony + ' says, "' + exclaim + ' If I were judging, I\'d pick';
        }

        if ((answers[pony].length == 1) && (answers[pony][0] == chosen[0]) && !judge) {
            var tail = ' ' + answers[pony][0] + ' too."';
        } else if (answers[pony].length == 1) {
            var tail = ' ' + answers[pony][0] + '."';
        } else if (judge) {
            var tail = '...actually, I\'m torn between ' + list_cards(answers[pony]) + '. I\'ll pick randomly: ' + chosen[0] + '.';
        } else {
            var tail = '...actually, I\'m torn between ' + list_cards(answers[pony]) + '.';
        }
        return leadin + tail;
    }

    lines.push(pony_report(curr_judge, true));
    // Remove judge from list of judges, refresh if necessary.
    session['judges'] = session['judges'].slice(1);
    if (session['judges'].length == 0) {
        session['judges'] = shuffle(ORDER.slice());
        // Next judge must differ!
        while (session['judges'][0] == curr_judge) {
            session['judges'] = shuffle(session['judges']);
        }
    }
    var next_judge = session['judges'][0];
    lines.push('"That\'s mine!" ' + next_judge + ' shouts. "I get a point."');
    lines.push('');

    for (var i = 0; i < ORDER.length; i++) {
        var pony = ORDER[i];
        if (pony == curr_judge) {
            continue;
        }
        lines.push(pony_report(pony, false));
    }
    lines.push('');

    // Add justification.
    var JUSTIFICATIONS = {
        'Applejack': ['"Applejack, why\'d you pick that card?"',
                      '"It really took the lead."'],
        'Twilight Sparkle': ['"Twilight, why\'d you pick that card?"',
                             '"It reminded me of reading a nice, long book."'],
        'Rainbow Dash': ['"Rainbow, why\'d you pick that card?"',
                         '"It was the most colorful."'],
        'Fluttershy': ['"Fluttershy, why\'d you pick that card?"',
                       '"It reminded me of the tea parties I like to have at home."'],
        'Rarity': ['"Rarity, why\'d you pick that card?"',
                   '"It was rarer than the other ones."'],
        'Pinkie Pie': ['"Pinkie Pie, why\'d you pick that card?"',
                       '"It reminded me of queueing, and voodoo, and sequoias and iguanas!"']};
    lines.push.apply(lines, JUSTIFICATIONS[curr_judge]);
    lines.push('');
    lines.push('The Mane 6 move all played cards to the discard pile.');
    if (green_return['shuffled']) {
        lines.push('Applejack looks at the green deck. "Hang on, we\'re out of green cards!" She shuffles the green discard pile back into the deck.');
    }
    if (red_return['shuffled']) {
        lines.push('Applejack looks at the red deck. "Hang on, we\'re out of red cards!" She shuffles the red discard pile back into the deck. "Strange", she says. "There should be more."');
    }
    lines.push('Everypony draws a new red card.')
    return [lines.join('\n'), reds_picked]
  }

  function do_exam() {
    session['last_did_exam'] = true;
    var lines = [];
    lines.push('Suddenly, in a flash of light, ' + APPLES.length + ' cards appear out of thin air.');
    lines.push('Applejack starts looking through them. "What the hay? These should have been in the deck the whole time!"');
    lines.push('"Well, perhaps this game was a puzzle after all," Rarity says. "How about we play one more round?"');
    lines.push('');
    lines.push('Out of the missing cards, enter the card ' + list_cards(ORDER) + ' would pick, in that order, separating the cards with commas.');
    lines.push('For example, if one of the missing cards was RED HERRING and you believe each pony would pick that card, enter "RED HERRING, RED HERRING, RED HERRING, RED HERRING, RED HERRING, RED HERRING".');

    var answers = winners(APPLES);
    var true_answers = [];
    for (var i = 0; i < ORDER.length; i++) {
        var pony = ORDER[i];
        true_answers.push(answers[pony][0]);
    }
    var true_reply = true_answers.join(', ');
    return lines.join('\n');
  }

  function verify_exam(guesses) {
    // Verify if the exam was passed.
    // First, handle an easter egg.
    var all_herring = true;
    for (var i = 0; i < guesses.length; i++) {
        if (guesses[i] != 'RED HERRING') {
            all_herring = false;
            break;
        }
    }
    if (all_herring) {
        return 'Okay, the example literally said it was a red herring. Did you expect that to work?';
    }
    // Accept some alternate spellings.
    var acceptable = [];
    var SPELLINGS = {
        'BRAEBURN': ['BRAEBURN'],
        'FUJI': ['FUJI'],
        'MCINTOSH': ['MCINTOSH', 'MACINTOSH'],
        'JAZZ': ['JAZZ'],
        'GOLDEN DELICIOUS': ['GOLDEN DELICIOUS']};
    var APPLE_ANSWERS = winners(APPLES);

    var correct = true;
    for (var i = 0; i < ORDER.length; i++) {
        var guess = guesses[i];
        var pony = ORDER[i];
        if (!SPELLINGS[APPLE_ANSWERS[pony][0]].includes(guess)) {
            correct = false;
            break;
        }
    }
    if (correct) {
        var lines = [];
        lines.push('Correct!');
        lines.push('');
        lines.push('In another flash of light, one final card appears.');
        lines.push('It reads "The ANSWER you seek lies at the LONG BRANCH SALOON."');
        return lines.join('\n');
    } else{
        return 'Incorrect.';
    }
  }

  function sortCards(red_cards, value_fn) {
    // biggest to smallest
    red_cards.sort(function (a, b) {
        // some value functions use floats, let's use direct comparison
        // to avoid any potential subtraction weirdness.
        var vala = value_fn(a);
        var valb = value_fn(b);
        if (vala < valb) {
            return 1;
        }
        if (vala > valb) {
            return -1;
        }
        return 0;
    });
    // report all cards that tie for best.
    var chosen_answers = [];
    var top_value = value_fn(red_cards[0]);
    for (var i = 0; i < red_cards.length; i++) {
        if (value_fn(red_cards[i]) == top_value) {
            chosen_answers.push(red_cards[i]);
        }
    }
    return chosen_answers;
  }

  function twilight_sparkle(red_cards) {
    // Longest, excluding spaces
    function value(answer) {
        var v = answer.replace(/ /g, '').length;
        return v;
    }
    return sortCards(red_cards, value);
  }

  function rainbow_dash(red_cards) {
    // most instances of letters in ROYGBIV
    function value(answer) {
        var count = 0;
        var rainbow = 'ROYGBIV';
        for (var i = 0; i < rainbow.length; i++) {
            if (answer.includes(rainbow[i])) {
                count++;
            }
        }
        return count;
    }
    return sortCards(red_cards, value);
  }

  function fluttershy(red_cards) {
    // most Ts
    function value(answer) {
        var count = 0;
        for (var i = 0; i < answer.length; i++) {
            if (answer[i] == 'T') {
                count++;
            }
        }
        return count;
    }
    return sortCards(red_cards, value);
  }


  var score = {"A": 1 , "B": 3 , "C": 3 , "D": 2 ,
             "E": 1 , "F": 4 , "G": 2 , "H": 4 ,
             "I": 1 , "J": 8 , "K": 5 , "L": 1 ,
             "M": 3 , "N": 1 , "O": 1 , "P": 3 ,
             "Q": 10, "R": 1 , "S": 1 , "T": 1 ,
             "U": 1 , "V": 4 , "W": 4 , "X": 8 ,
             "Y": 4 , "Z": 10, " ": 0};

  function rarity(red_cards) {
    // highest scrabble value of individual letter.
    function value(answer) {
        var highest = 0;
        for (var i = 0; i < answer.length; i++) {
            highest = Math.max(highest, score[answer[i]]);
        }
        return highest;
    }
    return sortCards(red_cards, value);
  }

  function pinkie_pie(red_cards) {
    // (number vowels) - (number consonants), ignore spaces
    function value(answer) {
        var vowels = 0;
        var consonants = 0;
        var VOW = ['A', 'E', 'I', 'O', 'U'];
        for (var i = 0; i < answer.length; i++) {
            var c = answer[i];
            if (c == ' ') {
                continue;
            }
            if (VOW.includes(c)) {
                vowels += 1;
            } else {
                consonants += 1;
            }
        }
        var v = vowels / (vowels + consonants);
        return v;
    }
    return sortCards(red_cards, value);
  }

  function applejack(red_cards) {
    // First alphabetically
    red_cards.sort();
    return [red_cards[0]];
  }

});
