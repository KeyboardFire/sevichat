// ==UserScript==
// @name sevichat
// @namespace http://keyboardfire.com/
// @author SE user Doorknob <andy@keyboardfire.com>
// @version 0.1
// @description sevichat == SE vi chat; vim-esque keyboard shortcuts for Stack Exchange chat
// @grant none
// @copyright MIT
// @include *://chat.stackoverflow.com/*
// @include *://chat.stackexchange.com/*
// @include *://chat.meta.stackexchange.com/*
// ==/UserScript==

// this will inject the code as a <script> element, because Safari doesn't seem
// to be using the page's jQuery properly
function withJQuery(f) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.textContent = '(' + f + ')(jQuery)';
    document.head.appendChild(script);
}
withJQuery(sevichat);

function sevichat($) {
    var input = $('#input');

    var currentMsg;
    var setCurrentMsg = function(m) {
        if (currentMsg) currentMsg.css('background-color', '');
        currentMsg = m;
        if (m) {
            m.css('background-color', 'rgba(0, 255, 0, 0.1)');
            document.body.scrollTop = m[0].offsetTop;
        }
    };

    var clickMenuItem = function(item) {
        currentMsg.find('.action-link').click();
        var intr = setInterval(function() {
            var popup = $('.popup');
            if (popup.length) {
                popup.find(item).click();
                clearInterval(intr);
            }
        }, 10);
    };

    var savedEdits = {}, msgEditing;

    input.keydown(function(e) {
        if (e.which == 27) {
            e.preventDefault();
            if ($('#cancel-editing-button').css('display') !== 'none') {
                savedEdits[msgEditing] = this.value;
                $('#cancel-editing-button').click();
            }
            setCurrentMsg();
        } else if (!currentMsg) {
            // ctrl+O
            if (e.which == 79 && e.ctrlKey) {
                e.preventDefault();
                setCurrentMsg($('.message:last'));
            }
        } else {
            e.preventDefault();
            switch (e.which) {
                case 68:  // d
                    if (confirm('ya sure about that?')) {
                        $.post('http://chat.stackexchange.com/messages/' +
                            currentMsg.attr('id').split('-')[1] + '/delete', {
                                fkey: fkey().fkey
                            });
                    }
                    setCurrentMsg();
                    break;
                case 69:  // e
                    msgEditing = currentMsg.attr('id');
                    clickMenuItem('.edit');
                    if (savedEdits[msgEditing]) {
                        setTimeout(function() {
                            $('#input').val(savedEdits[msgEditing]);
                        }, 1000);
                    }
                    setCurrentMsg();
                    break;
                case 70:  // f
                    currentMsg.find('.flags .vote').click();
                    setCurrentMsg();
                    break;
                case 74:  // j
                    var next = currentMsg.next('.message');
                    if (!next.length) {
                        next = currentMsg.closest('.monologue')
                            .nextAll('.monologue').eq(0).find('.message:first');
                    }
                    if (next.length) setCurrentMsg(next);
                    break;
                case 75:  // k
                    var prev = currentMsg.prev('.message');
                    if (!prev.length) {
                        prev = currentMsg.closest('.monologue')
                            .prevAll('.monologue').eq(0).find('.message:last');
                    }
                    if (prev.length) setCurrentMsg(prev);
                    break;
                case 80:  // p
                    clickMenuItem('.owner-star');
                    setCurrentMsg();
                    break;
                case 82:  // r
                    var replyBtn = currentMsg.find('.newreply');
                    if (replyBtn.length) replyBtn.click();
                    else $('#input').val(':' + currentMsg.attr('id')
                        .split('-')[1] + ' ' + $('#input').val().trimLeft());
                    setCurrentMsg();
                    break;
                case 83:  // s
                    currentMsg.find('.stars:first .vote').click();
                    setCurrentMsg();
                    break;
                case 89:  // y
                    prompt('hit ctrl+c', location.origin +
                        currentMsg.find('.action-link').attr('href'));
                    setCurrentMsg();
                    break;
            }
        }
    });

    // fire our listener before any other listener
    var kdevts = $('#input').data('events').keydown;
    kdevts.unshift(kdevts.pop());
}
