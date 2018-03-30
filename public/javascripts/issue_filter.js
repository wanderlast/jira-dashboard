var assigneeButtonGroup;
var assignees = {"apac": [], "brazil": [], "eu": [], "india": [], "japan": [], "spain": [], "us": []};
var groupFilters = {};

$(document).ready(function() {
  var grid = $('.grid');

  issues.forEach(function(issue) {
    grid.append(
      '<div class="issue-element ' + issue.issueType + ' ' + issue.priority + ' ' + issue.businessValue + ' ' + issue.region + ' ' + issue.assignee + '">' +
        '<img style="float: right; height: 16px; width: 16px;" src="/images/' + issue.issueType + '.svg" />' +
        '<img style="float: right; height: 16px; width: 16px;" src="/images/' + issue.priority + '.svg" />' +
        '<h3><a href="https://issues.liferay.com/browse/' + issue.key + '">' + issue.key + '</a></h3>' +
        '<h4>' + issue.assigneeDisplayName + '</h4>' +
        '<h4>' + issue.summary + '</h4>' +
      '</div>'
    );

    var assignee = "." + issue.assignee + "|" + issue.assigneeDisplayName;

    if (assignees[issue.region].indexOf(assignee) < 0) {
      assignees[issue.region].push(assignee);
    }
  });

  assigneeButtonGroup = $('#assignee-button-group');

  buildAssigneeButtons();

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
      filterGroup = groupFilters[filterType] = [];

      showAll(filterType);
    }
    else if (isChecked) {
      addFilter(filter, filterType, filterGroup);
    }
    else {
      removeFilter(filter, filterType, filterGroup);
    }

    if (filterType === "region") {
      buildAssigneeButtons(filterGroup, groupFilters["assignee"]);
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

function buildAssigneeButtons(regions, selectedAssignees) {
  var selectedAssigneesCopy = [];

  if (selectedAssignees) {
    selectedAssigneesCopy = selectedAssignees.slice();
  }

  //assigneeButtonGroup.empty();
  $('div[filter-type=assignee]').find('.button:not(.show-all)').remove();

  if (!regions || regions.length === 0) {
    regions = ["apac", "brazil", "eu", "india", "japan", "spain", "us"];
  }

  for (var i = 0; i < regions.length; i++) {
    var region = regions[i].replace(/\./g, '');

    var regionAssignees = assignees[region];

    for (var j = 0; j < regionAssignees.length; j++) {
      var assignee = regionAssignees[j].split("|");

      var cssClass;

      if (!selectedAssigneesCopy || (selectedAssigneesCopy.indexOf(assignee[0]) < 0)) {
        cssClass = "button";
      }
      else {
        selectedAssigneesCopy.splice(selectedAssigneesCopy.indexOf(assignee[0]), 1);

        cssClass = "button is-checked";
      }

      assigneeButtonGroup.append(
        '<button class="' + cssClass + '" data-filter="' + assignee[0] + '">' + assignee[1] + '</button>'
      );
    }
  }

  if (selectedAssigneesCopy && (selectedAssigneesCopy.length > 0)) {
    for (var k = 0; k < selectedAssigneesCopy.length; k++) {
      selectedAssignees.splice(selectedAssignees.indexOf(selectedAssigneesCopy[k]), 1);
    }
  }

  if (selectedAssignees && (selectedAssignees.length === 0)) {
    $('#assignee-show-all').addClass('is-checked');
  }
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