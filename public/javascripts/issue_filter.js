var groupFilters = {};

$(document).ready(function() {
  var grid = $('.grid');

  issues.forEach(function(issue) {
    grid.append(
      '<div class="issue-element ' + issue.issueType + ' ' + issue.priority + ' ' + issue.businessValue + ' ' + issue.region + '">' +
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
    var filterType = target.parent().attr('filter-type');

    var filterGroup = groupFilters[filterType];

    if (!filterGroup) {
      filterGroup = groupFilters[filterType] = [];
    }

    if (filter == "*") {
      groupFilters[filterType] = [];

      showAll(filterType);
    }
    else if (isChecked) {
      addFilter(filter, filterType, filterGroup);
    }
    else {
      removeFilter(filter, filterType, filterGroup);
    }

    var filters = [];

    for (var key in groupFilters) {
      var groupFilter = groupFilters[key];

      if (groupFilter.length) {
        filters.push(groupFilters[key]);
      }
    }

    var cartesianProductFilters = cartesianProduct(filters);

    console.log("Cart = " + cartesianProductFilters);
    issueGrid.isotope({
      filter: cartesianProductFilters.toString()
    });
  });
});

function addFilter(filter, filterType, filterGroup) {
  if (filterGroup.indexOf(filter) == -1) {
    filterGroup.push(filter);
  }

  $('#' + filterType + '-show-all').removeClass('is-checked');
}

function removeFilter(filter, filterType, filterGroup) {
  var index = filterGroup.indexOf(filter);

  if (index != -1) {
    filterGroup.splice(index, 1);
  }

  if (filterGroup.length == 0) {
    $('#' + filterType + '-show-all').addClass('is-checked');
  }
}

function showAll(filterType) {
  $('#' + filterType + '-show-all').addClass('is-checked');

  $('div[filter-type=' + filterType + ']').find('.button:not(.show-all)').each(function() {
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