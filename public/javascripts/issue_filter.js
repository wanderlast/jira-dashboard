var assigneeButtonGroup;
var assignees = {"apac": [], "brazil": [], "eu": [], "india": [], "japan": [], "spain": [], "us": []};
var groupFilters = {};

$(document).ready(function() {
  var grid = $('.grid');

  issues.forEach(function(issue) {
    var issueUpdateStatus = getIssueUpdateStatus(issue);

    grid.append(
      '<div class="issue-element ' + issue.issueType + ' ' + issue.priority + ' ' + issue.businessValue + ' ' + issue.region + ' ' + issue.assignee + ' ' + issueUpdateStatus + '">' +
        '<div class="issue-update issue-' + issueUpdateStatus + '"/>' +
        '<div class="issue-details">' +
          '<a href="https://issues.liferay.com/browse/' + issue.key + '">' + issue.key + '</a>' +
          '<img style="height: 16px; width: 16px; padding-left: 10px;" src="/images/' + issue.priority + '.svg" />' +
          '<img style="height: 16px; width: 16px;" src="/images/' + issue.issueType + '.svg" />' +
          '<span style="float: right;">' + issue.assigneeDisplayName + ' </span> <br> <br>' +
          '<span class="issue-summary">' + issue.summary + '</span>' +
          (issue.openDependencies ? '<br> <br> <span class="issue-summary">' + issue.openDependencies.join(", ") + '</span>' : '') +
        '</div>' +
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
    itemSelector: '.issue-element',
    masonry: {
      columnWidth: 75,
      gutter: 5
    }
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
  var assigneeButtons = new Set();
  var regionAssignees = [];
  var selectedAssigneesCopy = [];

  if (selectedAssignees) {
    selectedAssigneesCopy = selectedAssignees.slice();
  }

  $('div[filter-type=assignee]').find('.button:not(.show-all)').remove();

  if (!regions || regions.length === 0) {
    regions = ["apac", "brazil", "eu", "india", "japan", "spain", "us"];
  }

  for (var i = 0; i < regions.length; i++) {
    var region = regions[i].replace(/\./g, '');

    regionAssignees = regionAssignees.concat(assignees[region]);
  }

  regionAssignees.sort(function(a, b) {
    return a.localeCompare(b);
  });

  for (var j = 0; j < regionAssignees.length; j++) {
    var assignee = regionAssignees[j].split("|");

    var cssClass;

    if (!selectedAssignees || (selectedAssignees.indexOf(assignee[0]) < 0)) {
      cssClass = "button";
    }
    else {
      selectedAssigneesCopy.splice(selectedAssigneesCopy.indexOf(assignee[0]), 1);

      cssClass = "button is-checked";
    }

    assigneeButtons.add(
      '<button class="' + cssClass + '" data-filter="' + assignee[0] + '">' + assignee[1] + '</button>'
    );
  }

  if (selectedAssigneesCopy && (selectedAssigneesCopy.length > 0)) {
    for (var k = 0; k < selectedAssigneesCopy.length; k++) {
      selectedAssignees.splice(selectedAssignees.indexOf(selectedAssigneesCopy[k]), 1);
    }
  }

  if (selectedAssignees && (selectedAssignees.length === 0)) {
    $('#assignee-show-all').addClass('is-checked');
  }

  assigneeButtonGroup.append(Array.from(assigneeButtons));
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

function getIssueUpdateStatus(issue) {
  var hours;

  if (issue.openDependencies && (issue.openDependencies.indexOf("Code Review") > -1) && (issue.hoursSincePullRequest !== undefined)) {
    hours = issue.hoursSincePullRequest;
  }
  else {
    var hoursSinceAssigneeComment = issue.hoursSinceAssigneeComment;
    var hoursSinceStatusChange = issue.hoursSinceStatusChange;
    var hoursSinceVerified = issue.hoursSinceVerified;

    if ((hoursSinceAssigneeComment === undefined) && (hoursSinceStatusChange === undefined) && (hoursSinceVerified === undefined)) {
      hours = issue.hoursSinceAssigned;
    }
    else {
      hours = Math.min(hoursSinceAssigneeComment || Infinity, hoursSinceStatusChange || Infinity, hoursSinceVerified || Infinity);
    }
  }

  if (hours < 24) {
    return "up-to-date";
  }
  else if (hours < 72) {
    return "update-soon";
  }
  else {
    return "needs-update";
  }
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