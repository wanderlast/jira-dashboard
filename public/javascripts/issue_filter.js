var assigneeButtonGroup;
var assignees = {"apac": [], "brazil": [], "eu": [], "india": [], "japan": [], "spain": [], "us": []};
var groupFilters = {};

$(document).ready(function() {
  var grid = $('.grid');

  issues.forEach(function(issue) {
    var issueUpdateStatus = getIssueUpdateStatus(issue);

    grid.append(
      '<div class="issue-element ' + issue.issueType + ' ' + issue.priority + ' ' + (issue.status === "Blocked" ? 'blocked ' : '') + (issue.flagged ? 'flagged ' : '') + issue.region + ' ' + issue.assignee + ' ' + issueUpdateStatus + '">' +
        '<div class="issue-update issue-' + issueUpdateStatus + '"/>' +
        '<div class="issue-details">' +
          '<a href="https://issues.liferay.com/browse/' + issue.key + '">' + issue.key + '</a>' +
          '<img class="issue-icon-priority" src="/images/' + issue.priority + '.svg" />' +
          '<img class="issue-icon" src="/images/' + issue.issueType + '.svg" />' +
          (issue.flagged ? '<img class="issue-icon-flag" src="/images/flag.svg" />' : '') +
          '<span class="issue-assignee">' + issue.assigneeDisplayName + ' </span> <br> <br>' +
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

  var issueGrid = grid.isotope({
    itemSelector: '.issue-element',
    masonry: {
      columnWidth: 75,
      gutter: 5
    }
  });

  filterByUrlParameters(issueGrid);

  $('#filters').on('change', 'input[type=checkbox]', function(event) {
    updateFilter($(event.currentTarget), issueGrid);
  });

  $("#selected-filters").on('click', 'span', function(event) {
    var selectedFilterId = $(event.currentTarget).parent()[0].id;

    var filter = $("input[data-filter='" + selectedFilterId.substring(0, selectedFilterId.indexOf("-selected")) + "'");

    filter.prop('checked', false);

    updateFilter(filter, issueGrid);
  })
});

function addFilter(filter, filterGroup) {
  if (filterGroup.indexOf(filter) == -1) {
    filterGroup.push(filter);
  }
}

function addSelectedFilter(filter, filterName) {
  $('#selected-filters').append(
    '<label id="' + filter + '-selected">' +
      filterName +
      '<span>x</span>' +
    '</label>'
  )
}

function buildAssigneeCheckboxes(regions, selectedAssignees) {
  var assigneeButtons = new Set();
  var assigneesToUncheck = [];
  var regionAssignees = [];
 
  if (selectedAssignees) {
    assigneesToUncheck = selectedAssignees.slice();
  }

  $('div[filter-type=assignee]').empty();

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

    var checked = false;

    if (selectedAssignees && (selectedAssignees.indexOf(assignee[0]) > -1)) {
      assigneesToUncheck.splice(assigneesToUncheck.indexOf(assignee[0]), 1);

      checked = true;
    }

    assigneeButtons.add(
      '<label>' +
      '<input data-filter="' + assignee[0] + '" type="checkbox"' + (checked ? 'checked' : '') + '>' +
      assignee[1] +
      '</label>'
    );
  }

  if (assigneesToUncheck && (assigneesToUncheck.length > 0)) {
    for (var k = 0; k < assigneesToUncheck.length; k++) {
      selectedAssignees.splice(selectedAssignees.indexOf(assigneesToUncheck[k]), 1);
    }
  }

  assigneeButtonGroup.append(Array.from(assigneeButtons));
}

function filterByUrlParameters(issueGrid) {
  var urlFilterRegex = /[?&]+([^=&]+)=([^&]*)/gi;

  var match;
  var selectedFilters = [];

  while (match = urlFilterRegex.exec(location.href)) {
    var filterType = match[1];

    groupFilters[filterType] = match[2].split('+').map(function(filter) {
        filter = '.' + filter;

        selectedFilters.push(filter);

        return filter;
      });
  }

  buildAssigneeCheckboxes(groupFilters["region"], groupFilters["assignee"]);

  selectedFilters.forEach(function(filter) {
    var filterCheckbox = $("input[data-filter='" + filter + "'");

    filterCheckbox.prop('checked', true);

    addSelectedFilter(filter, filterCheckbox.parent()[0].innerText);
  });

  updateIssueGrid(issueGrid);
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

function removeFilter(filter, filterGroup) {
  var index = filterGroup.indexOf(filter);

  if (index != -1) {
    filterGroup.splice(index, 1);
  }
}

function removeSelectedFilter(filter) {
  $("#\\" + filter).remove();
}

function updateIssueGrid(issueGrid) {
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
}

function updateFilter(target, issueGrid) {
  var isChecked = target.prop('checked');
  var filter = target.attr('data-filter');
  var filterType = target.parent().parent().attr('filter-type');

  var filterGroup = groupFilters[filterType];

  if (!filterGroup) {
    filterGroup = groupFilters[filterType] = [];
  }

  if (isChecked) {
    addFilter(filter, filterGroup);

    addSelectedFilter(filter, target.parent()[0].innerText);
  }
  else {
    removeFilter(filter, filterGroup);

    removeSelectedFilter(filter + "-selected");
  }

  if (filterType === "region") {
    buildAssigneeCheckboxes(filterGroup, groupFilters["assignee"]);
  }

  updateIssueGrid(issueGrid);

  updateWindowHistoryState();
}

function updateWindowHistoryState() {
  var urlParameters = [];

  for (var key in groupFilters) {
    var filters = groupFilters[key];

    if (filters.length) {
      urlParameters.push(key + "=" + filters.join('+').replace(/\./g, ''));
    }
  }

  window.history.replaceState(null, '', '?' + urlParameters.join('&'))
}