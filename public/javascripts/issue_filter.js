var filters = ["*"];
var showAllButton;
var showAllFilter = "*";

$(document).ready(function() {
  var grid = $('.grid');

  showAllButton = $('#show-all');

  issues.forEach(function(issue) {
    grid.append(
      '<div class="issue-element ' + issue.issueType + '">' +
        '<h3>' + issue.key + '</h3>' +
        '<h4>' + issue.assignee + '</h4>' +
        '<h4>' + issue.summary + '</h4>' +
      '</div>'
    );
  });

  var issueGrid = grid.isotope({
    itemSelector: '.issue-element'
  });

  $('#filters').on('click', 'button', function(event) {
    var target = $(event.currentTarget);

    target.toggleClass('is-checked');

    var isChecked = target.hasClass('is-checked');

    var filter = target.attr('data-filter');

    if (filter == "*") {
      showAll();
    }
    else if (isChecked) {
      addFilter(filter);
    }
    else {
      removeFilter(filter);
    }

    issueGrid.isotope({
      filter: filters.join(',')
    });
  });
});

function addFilter(filter) {
  if (filters.indexOf(filter) == -1) {
    filters.push(filter);
  }

  var indexOfShowAllFilter = filters.indexOf(showAllFilter);

  if (indexOfShowAllFilter != -1) {
    showAllButton.removeClass('is-checked');

    filters.splice(indexOfShowAllFilter, 1);
  }
}

function removeFilter(filter) {
  var index = filters.indexOf(filter);

  if (index != -1) {
    filters.splice(index, 1);
  }

  if (filters.length == 0) {
    showAllButton.addClass('is-checked');

    filters = ["*"];
  }
}

function showAll() {
  filters = ["*"];

  $(".button:not(.show-all)").each(function() {
    $(this).removeClass('is-checked');
  });
}

function cartesianProduct(arr) {
  return arr.reduce(function(a, b) {
    return a.map(function(x) {
      return b.map(function(y) {
        return x + y;
      })
    }).reduce(function(a, b) {
      return a.concat(b)
    },[])
  }, [[]])
}