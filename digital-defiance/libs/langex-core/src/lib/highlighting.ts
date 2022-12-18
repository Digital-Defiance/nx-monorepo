import * as $ from 'jquery';

// TODO this is based on outdated code
let busy = false;

function add_links() {
  $('#primary .concept_light-wrapper, .page .concept_light-wrapper').each(
    function () {
      if ($(this).parent().find('.forvo').length > 0) {
        return;
      }

      const word = $(this).find('.concept_light-readings .text').text().trim();
      const href = $(
        '<a class="forvo concept_light-status_link">Play on Forvo</a>'
      ).insertBefore(
        $(this).parent().find('.concept_light-status > a').first()
      );
      href.click(function () {
        if (busy) {
          return;
        }

        busy = true;
        // chrome.runtime.sendMessage(
        //   null,
        //   { word: word },
        //   function (obj) {
        //     busy = false;
        //     if (obj !== null) {
        //       $('#forvo').html(obj);
        //       $('#forvo audio')[0].play();
        //     } else {
        //       href.text('Word not found');
        //     }
        //   }.bind(this)
        // );
      });
    }
  );
}

$(function () {
  add_links();

  const observer = new MutationObserver(function (mutations) {
    add_links();
  });

  observer.observe($('body')[0], { subtree: true, childList: true });
  $('<div id="forvo"/>').appendTo('body');
});
