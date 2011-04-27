
$(function() {

window.Page = Backbone.Model.extend({

  defaults: {
    content: "empty todo...",
    done: false
  },

  // Ensure that each todo created has `content`.
  initialize: function() {
    if (!this.get("content")) {
      this.set({"content": this.defaults.content});
    }
  },

  // Toggle the `done` state of this todo item.
  toggle: function() {
    this.save({done: !this.get("done")});
  },

  // Remove this Todo from *localStorage* and delete its view.
  clear: function() {
    this.destroy();
    this.view.remove();
  }

});

window.PageList = Backbone.Collection.extend({

  // Reference to this collection's model.
  model: Page,

  localStorage: new Store("pages"),

  // Filter down the list of all todo items that are finished.
  done: function() {
    return this.filter(function(page){ return page.get('done'); });
  },

  // Filter down the list to only todo items that are still not finished.
  remaining: function() {
    return this.without.apply(this, this.done());
  },

  nextOrder: function() {
    if (!this.length) return 1;
    return this.last().get('order') + 1;
  },

  comparator: function(todo) {
    return todo.get('order');
  }

});

window.Pages = new PageList;


// Todo Item View
// --------------

// The DOM element for a todo item...
window.PageView = Backbone.View.extend({

  //... is a list tag.
  tagName:  "li",

  // Cache the template function for a single item.
  template: _.template($('#item-template').html()),

  // The DOM events specific to an item.
  events: {
    "click .check"              : "toggleDone",
    "dblclick div.todo-content" : "edit",
    "click span.todo-destroy"   : "clear",
    "keypress .todo-input"      : "updateOnEnter"
  },

  // The TodoView listens for changes to its model, re-rendering. Since there's
  // a one-to-one correspondence between a **Todo** and a **TodoView** in this
  // app, we set a direct reference on the model for convenience.
  initialize: function() {
    _.bindAll(this, 'render', 'close');
    this.model.bind('change', this.render);
    this.model.view = this;
  },

  // Re-render the contents of the todo item.
  render: function() {
    $(this.el).html(this.template(this.model.toJSON()));
    this.setContent();
    return this;
  },

  // To avoid XSS (not that it would be harmful in this particular app),
  // we use `jQuery.text` to set the contents of the todo item.
  setContent: function() {
    var content = this.model.get('content');
    this.$('.todo-content').text(content);
    this.input = this.$('.todo-input');
    this.input.bind('blur', this.close);
    this.input.val(content);
  },

  // Toggle the `"done"` state of the model.
  toggleDone: function() {
    this.model.toggle();
  },

  // Switch this view into `"editing"` mode, displaying the input field.
  edit: function() {
    $(this.el).addClass("editing");
    this.input.focus();
  },

  // Close the `"editing"` mode, saving changes to the todo.
  close: function() {
    this.model.save({content: this.input.val()});
    $(this.el).removeClass("editing");
  },

  // If you hit `enter`, we're through editing the item.
  updateOnEnter: function(e) {
    if (e.keyCode == 13) this.close();
  },

  // Remove this view from the DOM.
  remove: function() {
    $(this.el).remove();
  },

  // Remove the item, destroy the model.
  clear: function() {
    this.model.clear();
  }

});



// The Application
// ---------------

// Our overall **AppView** is the top-level piece of UI.
window.AppView = Backbone.View.extend({

  // Instead of generating a new element, bind to the existing skeleton of
  // the App already present in the HTML.
  el: $(document),

  // Our template for the line of statistics at the bottom of the app.
  statsTemplate: _.template($('#stats-template').html()),

  // Delegated events for creating new items, and clearing completed ones.
  events: {
    "keypress #new-todo":  "createOnEnter",
    "keyup #new-todo":     "showTooltip",
    "click .todo-clear a": "clearCompleted"
  },

  initialize: function() {
    _.bindAll(this, 'addOne', 'addAll', 'render');

    this.input    = this.$("#new-todo");
    
    
    // Bind hash change for tabs
    var tabs = $("#tabs a");
    var classes = tabs.map(function() { return $(this).data("tab"); }).toArray().join(' ');
    
	$(window).bind("hashchange", function() {
		var hash = window.location.hash;
		if (classes.indexOf(hash.split('#')[1]) != -1) {
			tabs.filter("[href='" + hash + "']").click();
		}
	});
	
    tabs.click(function() {
    	$(document.body).removeClass(classes).addClass($(this).attr("href").split('#')[1])
    }).eq(0).click();

    Pages.bind('add',     this.addOne);
    Pages.bind('refresh', this.addAll);
    Pages.bind('all',     this.render);

    Pages.fetch();
  },

  // Re-rendering the App just means refreshing the statistics -- the rest
  // of the app doesn't change.
  render: function() {
    var done = Pages.done().length;
    this.$('#todo-stats').html(this.statsTemplate({
      total:      Pages.length,
      done:       Pages.done().length,
      remaining:  Pages.remaining().length
    }));
  },

  // Add a single todo item to the list by creating a view for it, and
  // appending its element to the `<ul>`.
  addOne: function(todo) {
    var view = new PageView({model: todo});
    log("Add on");
    this.$("#page-list").append(view.render().el);
  },

  addAll: function() {
    Pages.each(this.addOne);
  },

  newAttributes: function() {
    return {
      content: this.input.val(),
      order:   Pages.nextOrder(),
      done:    false
    };
  },

  // If you hit return in the main input field, create new **Todo** model,
  // persisting it to *localStorage*.
  createOnEnter: function(e) {
    if (e.keyCode != 13) return;
    Pages.create(this.newAttributes());
    this.input.val('');
  },

  // Clear all done todo items, destroying their models.
  clearCompleted: function() {
    _.each(Pages.done(), function(page){ page.clear(); });
    return false;
  },

  // Lazily show the tooltip that tells you to press `enter` to save
  // a new page item, after one second.
  showTooltip: function(e) {
    var tooltip = this.$(".ui-tooltip-top");
    var val = this.input.val();
    tooltip.fadeOut();
    if (this.tooltipTimeout) clearTimeout(this.tooltipTimeout);
    if (val == '' || val == this.input.attr('placeholder')) return;
    var show = function(){ tooltip.show().fadeIn(); };
    this.tooltipTimeout = _.delay(show, 1000);
  }

});

// Finally, we kick things off by creating the **App**.
window.App = new AppView;

});