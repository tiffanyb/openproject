let field_count = 0;

function showAddCCategoryForm() {
  jQuery("#add-ccategory-button").prop("disabled", true);
  jQuery("#c_category_add_form").css('display', 'block');
}

function hideAddCCategoryForm() {
  jQuery("#add-ccategory-button").prop("disabled", false);
  jQuery("#c_category_add_form").css('display', 'none');
}

function addCategoryField(e) {
  field_count += 1;
  jQuery("#fields-div").append('<div class="form--field"><input type="text" name="field' + field_count + '" /></div>');
  e.preventDefault();
}

jQuery(document).ready(function ($) {
  $("#add-ccategory-button").click(showAddCCategoryForm);
  $(".hide-c-category-form-button").click(hideAddCCategoryForm);
  $("#add-category-field--button").click(addCategoryField);
});
