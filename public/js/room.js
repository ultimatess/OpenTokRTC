// Generated by CoffeeScript 1.6.1
(function() {
  var User,
    _this = this;

  window.onresize = function() {
    return ResizeLayoutContainer();
  };

  User = (function() {

    function User(rid, apiKey, sid, token) {
      var self,
        _this = this;
      this.rid = rid;
      this.apiKey = apiKey;
      this.sid = sid;
      this.token = token;
      this.inputKeypress = function(e) {
        return User.prototype.inputKeypress.apply(_this, arguments);
      };
      this.streamCreatedHandler = function(event) {
        return User.prototype.streamCreatedHandler.apply(_this, arguments);
      };
      this.streamDestroyedHandler = function(event) {
        return User.prototype.streamDestroyedHandler.apply(_this, arguments);
      };
      this.sessionDisconnectedHandler = function(event) {
        return User.prototype.sessionDisconnectedHandler.apply(_this, arguments);
      };
      this.sessionConnectedHandler = function(event) {
        return User.prototype.sessionConnectedHandler.apply(_this, arguments);
      };
      this.subscribeStreams = function(streams) {
        return User.prototype.subscribeStreams.apply(_this, arguments);
      };
      this.removeStream = function(cid) {
        return User.prototype.removeStream.apply(_this, arguments);
      };
      this.messageTemplate = Handlebars.compile($("#messageTemplate").html());
      this.userStreamTemplate = Handlebars.compile($("#userStreamTemplate").html());
      this.notifyTemplate = Handlebars.compile($("#notifyTemplate").html());
      this.takenNames = {};
      this.roomRef = new Firebase("https://rtcdemo.firebaseIO.com/room/" + this.rid);
      this.chatRef = new Firebase("https://rtcdemo.firebaseIO.com/room/" + this.rid + "/chat/");
      this.usersRef = new Firebase("https://rtcdemo.firebaseIO.com/room/" + this.rid + "/users/");
      this.usersRef.on("child_added", function(childSnapshot, prevChildName) {
        _this.takenNames[childSnapshot.val().name] = true;
        return _this.displayChatMessage(_this.notifyTemplate({
          message: "" + (childSnapshot.val().name) + " has joined the room"
        }));
      });
      this.usersRef.on("child_removed", function(childSnapshot) {
        _this.takenNames[childSnapshot.val().name] = false;
        return _this.displayChatMessage(_this.notifyTemplate({
          message: "" + (childSnapshot.val().name) + " has left the room"
        }));
      });
      this.usersRef.on("child_changed", function(childSnapshot, prevChildName) {
        var val;
        console.log(childSnapshot.name());
        val = childSnapshot.val();
        if (val.filter) {
          self.applyClassFilter(val.filter, ".stream" + (childSnapshot.name()));
        }
        return _this.takenNames[childSnapshot.val().name] = true;
      });
      this.roomRef.once('value', function(snapshot) {
        if (!snapshot.child("sid").val()) {
          return snapshot.child("sid").ref().set(_this.sid);
        }
      });
      this.chatRef.on('child_added', function(snapshot) {
        var e, message, text, urlRegex, val, _i, _len;
        val = snapshot.val();
        text = val.text.split(' ');
        if (text[0] === "/serv") {
          _this.displayChatMessage(_this.notifyTemplate({
            message: val.text.split("/serv")[1]
          }));
          return;
        }
        message = "";
        urlRegex = /(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/g;
        for (_i = 0, _len = text.length; _i < _len; _i++) {
          e = text[_i];
          if (e.match(urlRegex) && e.split("..").length < 2 && e[e.length - 1] !== ".") {
            message += e.replace(urlRegex, "<a href='http://$2.$3$4' target='_blank'>$1$2.$3$4<a>") + " ";
          } else {
            message += Handlebars.Utils.escapeExpression(e) + " ";
          }
        }
        val.text = message;
        return _this.displayChatMessage(_this.messageTemplate(val));
      });
      $('#messageInput').keypress(this.inputKeypress);
      this.publisher = TB.initPublisher(this.apiKey, "myPublisher", {
        width: 240,
        height: 190
      });
      this.session = TB.initSession(this.sid);
      this.session.on("sessionConnected", this.sessionConnectedHandler);
      this.session.on("streamCreated", this.streamCreatedHandler);
      this.session.on("streamDestroyed", this.streamDestroyedHandler);
      this.session.on("sessionDisconnected", this.sessionDisconnectedHandler);
      this.session.connect(this.apiKey, this.token);
      self = this;
      $(".filterOption").click(function() {
        var prop;
        $(".filterOption").removeClass("optionSelected");
        prop = $(this).data('value');
        self.applyClassFilter(prop, "#myPublisher");
        $(this).addClass("optionSelected");
        return self.presenceRef.child("filter").set(prop);
      });
    }

    User.prototype.applyClassFilter = function(prop, selector) {
      $(selector).removeClass("Blur Sepia Grayscale Invert");
      $(selector).addClass(prop);
      return console.log("applyclassfilter..." + prop);
    };

    User.prototype.removeStream = function(cid) {
      var element$;
      element$ = $(".stream" + cid);
      return element$.remove();
    };

    User.prototype.subscribeStreams = function(streams) {
      var divId, divId$, self, stream, streamConnectionId, streamRef, _i, _len,
        _this = this;
      for (_i = 0, _len = streams.length; _i < _len; _i++) {
        stream = streams[_i];
        streamConnectionId = stream.connection.connectionId;
        if (this.session.connection.connectionId === streamConnectionId) {
          return;
        }
        divId = "stream" + streamConnectionId;
        $("#streams_container").append(this.userStreamTemplate({
          id: divId
        }));
        this.session.subscribe(stream, divId, {
          width: 240,
          height: 190
        });
        divId$ = $("." + divId);
        divId$.mouseenter(function() {
          return $(this).find('.flagUser').show();
        });
        divId$.mouseleave(function() {
          return $(this).find('.flagUser').hide();
        });
        self = this;
        divId$.find('.flagUser').click(function() {
          var streamConnection;
          streamConnection = $(this).data('streamconnection');
          if (confirm("Is this user being inappropriate? If so, we are sorry that you had to go through that. Click confirm to remove user")) {
            self.applyClassFilter("Blur", "." + streamConnection);
            return self.session.forceDisconnect(streamConnection.split("stream")[1]);
          }
        });
        streamRef = new Firebase("https://rtcdemo.firebaseIO.com/room/" + this.rid + "/users/" + streamConnectionId + "/filter");
        streamRef.once('value', function(dataSnapshot) {
          var val;
          val = dataSnapshot.val();
          return _this.applyClassFilter(val, ".stream" + streamConnectionId);
        });
      }
    };

    User.prototype.sessionConnectedHandler = function(event) {
      var date,
        _this = this;
      console.log("session connected");
      this.subscribeStreams(event.streams);
      this.session.publish(this.publisher);
      ResizeLayoutContainer();
      date = "" + (Date.now());
      this.name = "Guest" + (date.substring(date.length - 8, date.length));
      this.myConnectionId = this.session.connection.connectionId;
      this.presenceRef = new Firebase("https://rtcdemo.firebaseIO.com/room/" + this.rid + "/users/" + this.myConnectionId);
      this.presenceRef.child("name").set(this.name);
      this.presenceRef.onDisconnect().remove();
      $("#messageInput").removeAttr("disabled");
      $('#messageInput').focus();
      return setTimeout(function() {
        _this.displayChatMessage(_this.notifyTemplate({
          message: "-----------"
        }));
        _this.displayChatMessage(_this.notifyTemplate({
          message: "Welcome to OpenTokRTC."
        }));
        _this.displayChatMessage(_this.notifyTemplate({
          message: "Type /name <value> to change your name"
        }));
        return _this.displayChatMessage(_this.notifyTemplate({
          message: "-----------"
        }));
      }, 2000);
    };

    User.prototype.sessionDisconnectedHandler = function(event) {
      console.log(event.reason);
      if (event.reason === "forceDisconnected") {
        alert("Someone in the room found you offensive and removed you. Please evaluate your behavior");
      } else {
        alert("You have been disconnected! Please try again");
      }
      return window.location = "/";
    };

    User.prototype.streamDestroyedHandler = function(event) {
      var stream, _i, _len, _ref;
      _ref = event.streams;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        stream = _ref[_i];
        if (this.session.connection.connectionId === stream.connection.connectionId) {
          return;
        }
        this.removeStream(stream.connection.connectionId);
      }
      return ResizeLayoutContainer();
    };

    User.prototype.streamCreatedHandler = function(event) {
      console.log("streamCreated");
      this.subscribeStreams(event.streams);
      return ResizeLayoutContainer();
    };

    User.prototype.inputKeypress = function(e) {
      var parts, text;
      if (e.keyCode === 13) {
        text = $('#messageInput').val().trim();
        if (text.length < 1) {
          return;
        }
        parts = text.split(' ');
        if (parts[0] === "/name") {
          if (this.takenNames[parts[1]]) {
            alert("Sorry, but that name has already been taken.");
            return;
          }
          this.chatRef.push({
            name: this.name,
            text: "/serv " + this.name + " is now known as " + parts[1]
          });
          this.name = parts[1];
          this.presenceRef.child("name").set(this.name);
        } else {
          this.chatRef.push({
            name: this.name,
            text: text
          });
        }
        return $('#messageInput').val('');
      }
    };

    User.prototype.displayChatMessage = function(message) {
      $("#displayChat").append(message);
      return $('#displayChat')[0].scrollTop = $('#displayChat')[0].scrollHeight;
    };

    return User;

  })();

  window.User = User;

}).call(this);
