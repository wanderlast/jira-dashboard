$(document).ready(function() {
  var grid = $('.grid');

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

  $('#filters').on( 'click', 'button', function() {
    var filterValue = $(this).attr('data-filter');

    issueGrid.isotope({
      filter: filterValue
    });
  });
});