sap.ui.define(
  [
    "sap/m/Button",
    "./ErrorHandler",
    "sap/ui/core/Fragment",
    "./MessagePopover",
    "sap/ui/core/MessageType",
  ],
  (Button, ErrorHandler, Fragment, MessagePopover, MessageType) => {
    const MessagePopoverButton = Button.extend(
      "errorhandler.MessagePopoverButton",
      {
        metadata: {
          library: "errorhandler",
          defaultAggregation: "_items",
          aggregations: {
            _items: {
              type: "sap.m.MessageItem",
              multiple: true,
              singularName: "item",
            },
            _popover: {
              type: "sap.m.MessagePopover",
              multiple: false,
              visibility: "hidden",
            },
          },
          properties: {
            icon: {
              type: "string",
              defaultValue: "sap-icon://message-popup",
            },
            modelName: {
              type: "string",
              defaultValue: "message",
            },
            enableMail: {
              type: "boolean",
              defaultValue: false,
            },
          },
        },
        renderer: "sap.m.ButtonRenderer",

        init(...args) {
          Button.prototype.init.apply(this, ...args);

          const messageModel = ErrorHandler.getMessageModel();
          this.setModel(messageModel, "message");
        },

        openPopover() {
          const popover = this.getAggregation("_popover");

          if (popover.isOpen()) return;

          popover.openBy(this);
        },

        closePopover() {
          const popover = this.getAggregation("_popover");

          if (!popover.isOpen()) return;

          popover.close();
        },

        openPopover() {
          const popover = this.getAggregation("_popover");

          if (popover.isOpen()) return;

          popover.openBy(this);
        },

        closePopover() {
          const popover = this.getAggregation("_popover");

          if (!popover.isOpen()) return;

          popover.close();
        },
      }
    );

    MessagePopoverButton.prototype.onBeforeRendering = async function () {
      Button.prototype.onBeforeRendering.apply(this);

      if (this._alreadyBound) return;

      this._alreadyBound = true;

      const model = this.getModelName();
      const popover = new MessagePopover({
        enableMail: this.getEnableMail(),
      });

      this.setAggregation("_popover", popover);

      this.attachPress(() => popover.toggle(this));

      // das übergebene Model als Default-Model verwenden, damit die MessageItems einheitlich gebunden werden können
      this.setModel(this.getModel(model));

      const messageItem = await Fragment.load({
        id: this.getId(),
        name: `errorhandler.fragments.MessageItem`,
        controller: popover,
      });

      this.bindAggregation("_items", {
        path: "/",
        template: messageItem,
        templateShareable: true
      });

      popover.bindAggregation("items", this.getBindingInfo("_items"));

      this.bindProperty("type", {
        path: "/",
        model,
        formatter: (messages) =>
          messages.filter((message) => {
            const messageType = message.getType();
            return (
              messageType === MessageType.Error ||
              messageType === MessageType.Warning
            );
          }).length > 0
            ? "Emphasized"
            : "Default",
      });

      this.bindProperty("text", {
        path: "/",
        model,
        formatter: (messages) =>
          messages.filter((message) => {
            const messageType = message.getType();
            return (
              messageType === MessageType.Error ||
              messageType === MessageType.Warning
            );
          }).length,
      });
    };

    return MessagePopoverButton;
  }
);
