$(function() {
    var ua = navigator.userAgent;
    var milkcocoa = new MilkCocoa("https://io-vi5rfhw1q.mlkcca.com");
    var room = location.hash.substr(1);
    if (room == "") room = "_empty";
    var fusenDataStore = milkcocoa.dataStore('fusen');
    var ds = fusenDataStore.child(room);
    var curClr = "white";
    var WindowHeight = $(window).height();

    milkcocoa.getCurrentUser(function(err, user) {
        if (err == 1) {
            open_login_modal();

        } else {
            ready();
        }
    });

    function jsmodal(id) {
        var elem = document.getElementById(id);
        var overlap = window.document.createElement("div");
        overlap.setAttribute("style", "z-index:120; filter:alpha(opacity=70);");
        overlap.style.display = "block";
        overlap.style.opacity = "0.7";
        overlap.style.position = "absolute";
        overlap.style.width = "100%";
        overlap.style.height = "100%";
        overlap.style.top = "0px";
        overlap.style.left = "0px";
        overlap.style.backgroundColor = "#222";
        return {
            open: function(_option) {
                var option = _option || {};
                var self = this;
                elem.style.display = 'block';
                window.document.body.appendChild(overlap);

                for (var i = 0; i < elem.childNodes.length; i++) {
                    if (elem.childNodes[i].className == "jsmodal-window-close") {
                        console.log(elem.childNodes[i].className);
                        elem.childNodes[i].onclick = function() {
                            self.close();
                            return false;
                        }
                    }
                }
                if (option.modal == false) {
                    overlap.onmousedown = function(e) {
                        if (!check(e.target)) {
                            self.close();
                            return false;
                        }

                        function check(t, index) {
                            if (!t) return false;
                            if (index > 5) return false;
                            if (t.className == "jsmodal-window") {
                                return true;
                            } else {
                                return check(t.parentNode, index++);
                            }
                        }
                        return true;
                    }
                }
            },
            close: function() {
                elem.style.display = 'none';
                if (overlap.remove) overlap.remove();
                else window.document.body.removeChild(overlap);
            }
        }
    }

    function open_register_modal() {
        var self = this;
        var register_modal = jsmodal("register-modal");
        register_modal.open({
            modal: true
        });
        $("#register-btn").off("click").click(function() {
            var email = $("#register-email").val();
            var password = $("#register-password").val();
            var password2 = $("#register-password2").val();
            if (email && (password == password2)) {
                milkcocoa.addAccount(email, password, {}, function(err, user) {
                    if (user) {
                        register_modal.close();
                        open_login_modal();
                    } else {
                        if (err == 1)
                            $("#reg-message").html("Emailが正しくありません。");
                        else if (err == 2)
                            $("#reg-message").html("すでに使われているEmailアドレスです。");
                    }
                });
            } else {
                $("#reg-message").html("入力エラー");
            }

        });
        $("#switch-to-login-btn").off("click").click(function() {
            register_modal.close();
            open_login_modal();
        });
    }

    function open_login_modal() {
        var login_modal = jsmodal("login-modal");
        login_modal.open({
            modal: true
        });
        $("#login-btn").off("click").click(function() {
            var email = $("#login-email").val();
            var password = $("#login-password").val();
            if (email && password) {
                milkcocoa.login(email, password, function(err, user) {
                    if (user) {
                        login_modal.close();
                        ready();
                    } else {
                        if (err == 1)
                            $("#login-message").html("Emailが正しくありません。");
                        else if (err == 2)
                            $("#login-message").html("Emailアドレスかパスワードが違います。");
                        else if (err == 3)
                            $("#login-message").html("確認メールを送信しています。ご確認ください。");
                    }
                });
            } else {
                $("#login-message").html("入力エラー");
            }
        });
        $("#switch-btn").off("click").click(function() {
            login_modal.close();
            open_register_modal();
        });
    }

    function ready() {

        if (ua.indexOf('iPhone') > 0 || ua.indexOf('iPad') > 0 || ua.indexOf('iPod') > 0 || ua.indexOf('Android') > 0) {
            $(".currentColor").on("tap", function(e) {
                curClr = $(this).attr("id");
                $(".currentColor").each(function() {
                    $(this).removeClass("active");
                });

                $(this).addClass("active");
                e.stopPropagation();
            });
        } else {
            $(".currentColor").click(function(e) {
                curClr = $(this).attr("id");
                $(".currentColor").each(function() {
                    $(this).removeClass("active");
                });

                $(this).addClass("active");
                e.stopPropagation();
            });
        }

        function Fusen(_id, text, color) {
            var id = _id;

            if (ua.indexOf('iPhone') > 0 || ua.indexOf('iPad') > 0 || ua.indexOf('iPod') > 0 || ua.indexOf('Android') > 0) {
                $("#canvas").append('<div id="' + id + '" class="husen ' + color + '">' + text + '<div class="graytext">長押し削除</div></div>');
            } else {
                $("#canvas").append('<div id="' + id + '" class="husen ' + color + '">' + text + '<div class="cross">×</div></div>');
            }

            var pos = {
                x: 0,
                y: 0
            };
            var cross = $(".cross", "#" + id);

            $("#" + id).draggable({
                start: function() {},
                drag: function() {
                    pos.x = $("#" + id).position().left;
                    pos.y = $("#" + id).position().top;
                },
                stop: function() {
                    ds.child(id).set({
                        x: pos.x,
                        y: pos.y
                    }, function() {});
                },
                containment: "#container"
            });

            cross.click(function(e) {
                ds.remove(id);
                e.stopPropagation();
            });

            if (ua.indexOf('iPhone') > 0 || ua.indexOf('iPad') > 0 || ua.indexOf('iPod') > 0 || ua.indexOf('Android') > 0) {
                $("#" + id).on("taphold", tapholdHandler);
            }

            function tapholdHandler(e) {
                ret = confirm("このメッセージを削除しますか？");
                if (ret == true) {
                    ds.remove(id);
                }
            }

            function setPos(x, y) {
                pos.x = x;
                pos.y = y;
                $("#" + id).offset({
                    top: pos.y,
                    left: pos.x
                });
            }

            function removeSelf() {
                $("#" + id).remove();
            }

            return {
                setPos: setPos,
                removeSelf: removeSelf
            }
        }

        ds.query({}).done(function(e) {
            for (var i = 0; i < e.length; i++) {
                create_memo(e[i].id, e[i].x, e[i].y, e[i].text, e[i].color);
            }
        });

        ds.on('push', function(pushed) {
            create_memo(pushed.id, pushed.value.x, pushed.value.y, pushed.value.text, pushed.value.color);
        });

        ds.on('set', function(setted) {
            fusen_set[setted.id].setPos(setted.value.x, setted.value.y);
        });

        ds.on('remove', function(_removed) {
            var removed = _removed;
            fusen_set[removed.id].removeSelf();
        });

        var fusen_set = {};

        function create_memo(id, x, y, text, color) {
            var fusen = new Fusen(id, text, color);
            fusen.setPos(x, y);
            fusen_set[id] = fusen;
        }

        $("#back").click(function(e) {
            //console.log(e);
            var text = prompt("メモを入力してください。");
            var _curClr = curClr;

            if (!text) {
                return;
            }

            ds.push({
                x: e.pageX,
                y: e.pageY,
                text: htmlEscape(text),
                color: _curClr
            }, function() {});
        });

        document.getElementById("btn").onclick = function() {
            var text = document.getElementById("txt").value;
            var _curClr = curClr;

            if (!text) {
                return;
            }

            ds.push({
                x: 330,
                y: 50,
                text: htmlEscape(text),
                color: _curClr
            }, function() {});
            document.getElementById("txt").value = "";
        };
        // 日付入力用
        document.getElementById("btn3").onclick = function() {
            var text;
            var year = new Date();
            var month = document.getElementById("month").value;
            var day = document.getElementById("day").value;
            var _curClr = curClr;
            var myDay = new Array("日", "月", "火", "水", "木", "金", "土");
            var myDate = new Date(year.getFullYear(), month - 1, day);
            var myWeek = myDate.getDay();

            if (!month || !day) {
                return;
            }
            text = "　　　　" + month + "月" + day + "日" + "(" + myDay[myWeek] + ")";

            ds.push({
                x: 330,
                y: 50,
                text: htmlEscape(text),
                color: _curClr
            }, function() {});
        };

        function htmlEscape(s) {
            s = s.replace(/&/g, '&amp;');
            s = s.replace(/>/g, '&gt;');
            s = s.replace(/</g, '&lt;');
            return s;
        }

        document.getElementById("btn2").onclick = function() {
            document.getElementById("txt").value = "";
        };
    }
});

//$("#container").css("height", WindowHeight + "px");
