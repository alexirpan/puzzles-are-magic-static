$(document).ready(function() {
    // Static answer checker that lives in browser, to reduce server needs, and also
    // because we don't want to track submissions made.
    //
    // DO NOT CONTINUE PAST THIS POINT OR YOU'LL FIND ANSWER SPOILERS!!!
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    function cleanAnswer(answer) {
        var cleaned = answer.replace(/[^0-9a-zA-Z]/g, '');
        cleaned = cleaned.toUpperCase();
        return cleaned;
    }

    // puzzle ID --> response --> reply
    var RAW_ANSWERS = {
        'art-of-the-dress': {
            'pantone': 'Keep going!',
            'partisan': 'It\'s time we settled this, with a vote. During the hunt, teams were asked to vote by sending an email to puzzlesaremagic+thedress@gmail.com. whose subject was exactly "White and Gold" or "Blue and Black". This triggered an auto-reply system that gave the answer. This system is still online - send an email, or read the solution to get the puzzle\'s answer.',
            'green boots': 'Correct!'
        },
        'not-quite-a-polka': {
            'maid of the mist': 'Correct!'
        },
        'applejacks-game': {
            'red herring red herring red herring red herring red herring red herring': "Why don't you look up the meaning of RED HERRING before you guess it?",
            'long branch saloon': 'Correct!'
        },
        'number-hunting': {
            'CHRONOMALYATLANDISORTITANICMOTHSAY': 'Almost there!',
            '6or28': "What's one way to describe 6 and 28?",
            '6or28say': "What's one way to describe 6 and 28?",
            'SIXORTWENTYEIGHT': "What's one way to describe 6 and 28?",
            'SIXORTWENTYEIGHTSAY': "What's one way to describe 6 and 28?",
            'perfect': "Correct!"
        },
        'equestrian-tour': {
            'placebiggerontheinside': "Almost there! What's a place bigger on the inside?",
            'tardis': 'Correct!'
        },
        'recommendations': {
            'findnextlyrics': 'Keep going!',
            'ponyvillefmcom': "The version that ran during the hunt is no longer solvable, but you may be able to find the answer at Ponyville Live. If you can't, check the solution for the answer.",
            'bluehedgehogfivewithparem': 'It\'s just "Blue Hedgehog (Five)". We\'re not really DJing a show.',
            'bluehedgehogfive': 'What notable blue hedgehog has a five letter name?',
            'sonic': 'Correct!'
        },
        'imperial-geography': {
            'SEEWIKIPEDIALISTOFUTCTIMEOFFSETS': 'That sounds like a good thing to do!',
            'FIGHTERCMDSUBIQUITOUSHAWKERPLANE': 'Almost there! Read the cluephrase as "FIGHTER CMDS UBIQUITOUS HAWKER PLANE"',
            'FIGHTERCMDSUBIQUITOUSHAWKERPLANE 9': 'Almost there! Read the cluephrase as "FIGHTER CMDS UBIQUITOUS HAWKER PLANE"',
            'hurricane': 'Correct!'
        },
        'a-to-zecora': {
            'CTERMTONTERMREWSNANOITCARTTA': 'Almost there! Make sure you read in the right order.',
            'attraction': 'Correct!'
        },
        'its-a-long-story': {
            'baltimore convention center': 'Correct!'
        },
        'seasoned-traveler': {
            'the return of nightmare moon': 'Correct!'
        },
        'cross-eyed': {
            'ipsniraiton': 'Almost there! Remember how the crossword works.',
            'inspiration': 'Correct!'
        },
        'flying-high': {
            '1250ft': "Almost there! What's something that's 1250 ft?",
            'empire state building': 'Correct!'
        },
        'anthropology': {
            'gauntlet': 'Correct!'
        },
        'the-key-is-going-slow-and-steady': {
            'petsleft': 'Keep going!',
            'irargvna': "Well, that looks like gibberish. Maybe there's a way to transform it.",
            'venetian': 'Correct!'
        },
        'endgame': {
            'youhavefoundeverywordmarvelousjobnowaddawordtoeach': 'Marvelous! Follow the given instruction.',
            'bring back elements by pulling a time heist': 'Correct!'
        },
        'elements-war': {
            'harmonious rainbow': 'Correct!'
        }
    }
    // clean answer
    var ANSWERS = {};
    for (var k1 in RAW_ANSWERS) {
        ANSWERS[k1] = {};
        for (var k2 in RAW_ANSWERS[k1]) {
            ANSWERS[k1][cleanAnswer(k2)] = RAW_ANSWERS[k1][k2];
        }
    }

    function respondToSubmission(puzzle_id, answer) {
        var responses = ANSWERS[puzzle_id];
        var triggers = Object.keys(responses);
        var key = cleanAnswer(answer);
        if (triggers.includes(key)) {
            return responses[key];
        }
        return 'Wrong Answer.';
    }

    function receiveAnswerReply(answer, reply) {
        $("#answerrepeat").removeClass("correct_color");
        $("#answerrepeat").removeClass("wrong_color");
        $("#answerrepeat").removeClass("medium_color");
        if (reply === "Correct!") {
            $("#answerrepeat").addClass("correct_color");
        } else if (reply === "Wrong Answer.") {
            $("#answerrepeat").addClass("wrong_color");
        } else {
            $("#answerrepeat").addClass("medium_color");
        }
        $("#answerrepeat").html(cleanAnswer(answer) + ": ");
        $("#answerreply").html(reply);
    }

    function checkAnswer() {
        var answer = $('#answerinput').val();
        var reply = respondToSubmission(puzzle_id, answer);
        receiveAnswerReply(answer, reply);
        $('#answerinput').val('');
    }

    // puzzle_id constant defined in template.
    function turnOnAnswerCheck() {
        $('#answercheckbutton').unbind('click');
        $('#answercheckbutton').click(function() {
            checkAnswer();
        });
    }

    turnOnAnswerCheck();
    // Enter for answer checking if answerinput box is selected.
    $(document).on("keypress", "#answerinput", function(e) {
      if (e.which == 13) {
          checkAnswer();
      }
    });
});
