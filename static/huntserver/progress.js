$(document).ready(function() {
  function recolor () {
    $(".available").each(function(){
      var time_diff = Math.floor(Date.now()/1000) - $(this).data("date");
      var ratio = Math.max(Math.min((1-time_diff/14400), 1), 0)*55;
      var color = "hsla(" + ratio + ",100%, 75%, 1)"
      $(this).css("background", color);
    });
  }
  recolor();
  setInterval(recolor, 5000);

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

  sorting_dict = {
    "# Meta Solves": "meta_rank",
    "# Puzzle Solves": "rank",
    "Points": "points",
    "Last Puzzle Time": "last",
    "Last Meta Time": "meta_last",
    "Hunt Finish Time": "final_last",
  }

  function update_values() {
    $(".team_row").each(function(index) {
      var result = 0;
      var meta_result = 0;
      var last = 0;
      var meta_last = 0;
      var final_last = Number.MAX_SAFE_INTEGER;
      $(this).find(".solved").each(function(sub_index) {
        if($(this).closest("table").find("th").eq($(this).index()).hasClass("metapuzzle")) {
          meta_result = meta_result + 1;
          if($(this).data("date") > meta_last) {
            meta_last = $(this).data("date");
          }
        } else {
          result = result + 1;
          if($(this).data("date") > last) {
            last = $(this).data("date");
          }
        }
        if($(this).closest("table").find("th").eq($(this).index()).hasClass("finalpuzzle")) {
          final_last = $(this).data("date");
        }
      })
      $(this).find(".num").html(result+3*meta_result);
      $(this).data("meta_rank", meta_result);
      $(this).data("rank", result);
      $(this).data("points", 3 * meta_result + result);
      $(this).data("last", -1 * last); // allows consistent low->high sorting
      $(this).data("meta_last", -1 * meta_last);
      $(this).data("final_last", -1 * final_last);
      if($(this).data("index") == undefined){
        $(this).data("index", $(this).index());
      }
    })
  }  

  function sort_table(table) {
    tbody = table.find('tbody');

    tbody.find('.team_row').sort(function(a, b) {
      critera1 = sorting_dict[$("#sort_select1").val()]
      critera2 = sorting_dict[$("#sort_select2").val()]
      critera3 = sorting_dict[$("#sort_select3").val()]
      critera4 = sorting_dict[$("#sort_select4").val()]
      sort1 = $(b).data(critera1) - $(a).data(critera1);
      if(sort1) {
        return sort1;
      }
      sort2 = $(b).data(critera2) - $(a).data(critera2);
      if(sort2) {
        return sort2;
      }
      sort3 = $(b).data(critera3) - $(a).data(critera3);
      if(sort3) {
        return sort3;
      }
      sort4 = $(b).data(critera4) - $(a).data(critera4);
      if(sort4) {
        return sort4;
      }
      return $(a).data("index") - $(b).data("index");
    }).appendTo(tbody);
  }

  function unsort_table(table) {
    tbody = table.find('tbody');

    tbody.find('.team_row').sort(function(a, b) {
      return $(a).data("index") - $(b).data("index");
    }).appendTo(tbody);
  }

  var get_posts = function() {
    if(is_visible()){
      $.ajax({
        type: 'get',
        url: "/staff/progress/",
        data: {last_solve_pk: last_solve_pk, last_unlock_pk: last_unlock_pk,
               last_submission_pk: last_submission_pk},
        success: function (response) {
          var response = JSON.parse(response);
          messages = response.messages
          if(messages.length > 0){
            for (var i = 0; i < messages.length; i++) {
              receiveMessage(messages[i]);
              console.log(messages[i]);
            };
            last_solve_pk = response.update_info[0];
            last_unlock_pk = response.update_info[1];
            last_submission_pk = response.update_info[2];
          }
        },
        error: function (html) {
          console.log(html);
        }
      });
      update_values();
      if($("#sort_check").is(":checked")) {
        sort_table($("table"));
      } else {
        unsort_table($("table"));
      }
    }
  }
  setInterval(get_posts, 3000);


  $('.unlock_form').on('submit', function(e) {
    e.preventDefault();
    $.ajax({
      url : $(this).attr('action') || window.location.pathname,
      type: "POST",
      data: $(this).serialize(),
      error: function (jXHR, textStatus, errorThrown) {
        alert(errorThrown);
        console.log(jXHR);
      }
    });
  });

  function receiveMessage(update) {
    $td = $("#p" + update.puzzle.id + "t" + update.team_pk);
    if(update.status_type == "solve"){
      $td.removeClass();
      $td.addClass('solved');
      $td.html(update.time_str);
      $td.css("background", "");
      $td.data("date", (Date.now()/1000));
    }
    else if(update.status_type == "unlock"){
      $td.removeClass();
      $td.addClass('available');
      $td.data("date", (Date.now()/1000));
      $td.html(" ");
    }
    else if(update.status_type == "submission"){
      $td.html("<b>" + update.time_str + "</b>");
    }
  }
});
