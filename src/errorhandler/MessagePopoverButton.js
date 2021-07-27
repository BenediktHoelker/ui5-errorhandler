sap.ui.define(
  ["sap/m/Button", "./MessagePopover"],
  (Button, MessagePopover) => {
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
              defaultValue: "sap-icon://bar-code",
            },
            text: {
              type: "string",
              defaultValue: "",
            },
          },
        },

        renderer: "sap.m.ButtonRenderer",

        init(...args) {
          // eslint-disable-next-line prefer-rest-params
          Button.prototype.init.apply(this, ...args);

          this.setAggregation("_popover", new MessagePopover());

          this.attachPress(() => this.getAggregation("_popover").toggle(this));
        },
      }
    );

    MessagePopoverButton.prototype.onBeforeRendering = function () {
      this.getAggregation("_popover").bindAggregation(
        "items",
        this.getBindingInfo("items")
      );
    };

    return MessagePopoverButton;
  }
);
