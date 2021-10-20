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
          },
        },

        renderer: "sap.m.ButtonRenderer",

        init(...args) {
          const messageModel = ErrorHandler.getMessageModel();

          this.setModel(messageModel, "message");

          Button.prototype.init.apply(this, ...args);

          this.setAggregation(
            "_popover",
            new MessagePopover({
              activeTitlePress: (event) => this.onFocusControl(event),
            })
          );

          this.attachPress(() => this.getAggregation("_popover").toggle(this));
        },
      }
    );

    MessagePopoverButton.prototype.isItemPositionable = function (controlIds) {
      return controlIds && Array.isArray(controlIds) && controlIds.length > 0;
    };

    MessagePopoverButton.prototype.onFocusControl = function (event) {
      const button = event.getSource().getParent();
      const toolbar = button.getParent();
      const page = toolbar.getParent();
      const message = event
        .getParameter("item")
        .getBindingContext()
        .getObject();
      const control = sap.ui.getCore().byId(message.getControlId());
      if (!control || !page || typeof page.scrollToElement !== "function")
        return;
      page.scrollToElement(control.getDomRef(), 200);
      setTimeout(() => control.focus(), 300);
    };

    MessagePopoverButton.prototype.onBeforeRendering = async function () {
      const model = this.getModelName();
      // das übergebene Model als Default-Model verwenden, damit die MessageItems einheitlich gebunden werden können
      this.setModel(this.getModel(model));

      const messageItem = await Fragment.load({
        id: this.getId(),
        name: `errorhandler.fragments.MessageItem`,
        controller: this,
      });

      this.bindAggregation("_items", {
        path: "/",
        template: messageItem,
      });

      this.getAggregation("_popover").bindAggregation(
        "items",
        this.getBindingInfo("_items")
      );

      this.bindProperty("type", {
        path: "/",
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
