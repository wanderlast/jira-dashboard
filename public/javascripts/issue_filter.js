var assignees = {"apac": [], "brazil": [], "eu": [], "india": [], "japan": [], "spain": [], "us": []};
var groupFilters = {};

$(document).ready(function() {
  var grid = $('.grid');

  issues.forEach(function(issue) {
    grid.append(
      '<div class="issue-element ' + issue.issueType + ' ' + issue.priority + ' ' + issue.businessValue + ' ' + issue.region + ' ' + issue.assignee + '">' +
        '<h3>' + issue.key + '</h3>' +
        '<h4>' + issue.assignee + '</h4>' +
        '<h4>' + issue.summary + '</h4>' +
      '</div>'
    );

    var assignee = issue.assignee + "|" + issue.assigneeDisplayName;

    if (assignees[issue.region].indexOf(assignee) < 0) {
      assignees[issue.region].push(assignee);
    }
  });

  var assigneeButtonGroup = $('#assignee-button-group');

  for (var region in assignees) {
    var regionAssignees = assignees[region];

    for (var i = 0; i < regionAssignees.length; i++) {
      var assignee = regionAssignees[i].split("|");

      assigneeButtonGroup.append(
        '<button class="button" data-filter=".' + assignee[0] + '">' + assignee[1] + '</button>'
      );
    }
  }

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

    var filterCombinations = getFilterCombinations(filters);

    issueGrid.isotope({
      filter: filterCombinations.toString()
    });
  });
});

function addFilter(filter, filterType, filterGroup) {
  if (filterGroup.indexOf(filter) == -1) {
    filterGroup.push(filter);
  }

  $('#' + filterType + '-show-all').removeClass('is-checked');
}

function getFilterCombinations(arr) {
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