sap.ui.define(
  [
    "sap/m/Button",
    "./ErrorHandler",
    "sap/ui/core/Fragment",
    "./MessagePopover",
  ],
  (Button, ErrorHandler, Fragment, MessagePopover) => {
    const MessagePopoverButton = Button.extend(
      "errorhandler.MessagePopoverButton",
      {
        metadata: {
          library: "errorhandler",
          defaultAggregation: "items",
          aggregations: {
            items: {
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
            text: {
              type: "string",
              defaultValue: "",
            },
          },
        },

        renderer: "sap.m.ButtonRenderer",

        init(...args) {
          const messageModel = ErrorHandler.getMessageModel();
          this.setModel(messageModel, "message");

          this._defaultText = this.getText();
          this._defaultType = this.getType();

          // eslint-disable-next-line prefer-rest-params
          Button.prototype.init.apply(this, ...args);

          this.setAggregation("_popover", new MessagePopover());

          this.attachPress(() => this.getAggregation("_popover").toggle(this));
        },
      }
    );

    MessagePopoverButton.prototype.onBeforeRendering = async function () {
      if (!this.getBindingInfo("items")) {
        const messageItem = await Fragment.load({
          id: this.getId(),
          name: `errorhandler.fragments.MessageItem`,
          controller: this,
        });

        this.bindAggregation("items", {
          path: "/",
          model: "message",
          template: messageItem,
        });
      }

      this.getAggregation("_popover").bindAggregation(
        "items",
        this.getBindingInfo("items")
      );

      if (
        !this.getBindingInfo("type") &&
        this.getType() === this._defaultType
      ) {
        this.bindProperty("type", {
          path: "/",
          model: "message",
          formatter: (messages) =>
            messages.length > 0 ? "Emphasized" : "Default",
        });
      }

      if (
        !this.getBindingInfo("text") &&
        this.getText() === this._defaultText
      ) {
        this.bindProperty("text", {
          path: "/",
          model: "message",
          formatter: (messages) => messages.length,
        });
      }
    };

    return MessagePopoverButton;
  }
);
