/*
	SPFieldControl - directive
	
	Pau Codina (pau.codina@kaldeera.com)
	Pedro Castro (pedro.castro@kaldeera.com, pedro.cm@gmail.com)

	Copyright (c) 2014
	Licensed under the MIT License
*/



///////////////////////////////////////
//	SPFieldControl
///////////////////////////////////////

angular.module('ngSharePoint').directive('spfieldControl', 

	['$compile', '$templateCache', '$http',

	function spfieldControl_DirectiveFactory($compile, $templateCache, $http) {

		var spfieldControl_DirectiveDefinitionObject = {

			restrict: 'EA',
			require: '^spform',
			replace: true,
			templateUrl: 'templates/form-templates/spfield-control.html',


			link: function($scope, $element, $attrs, spformController) {

				var name = ($attrs.name || $attrs.spfieldControl);
				var schema = spformController.getFieldSchema(name);
				
				if (schema !== void 0) {

					// Sets the default value for the field
					spformController.initField(name);

					// NOTE: Include a <spfield-control name="<name_of_the_field>" mode="hidden" /> to initialize the field with it's default value.
					if ($attrs.mode == 'hidden') {
						$element.addClass('ng-hide');
 						return;
					}

					// Gets the field type
					var fieldType = schema.TypeAsString;
					if (fieldType === 'UserMulti') fieldType = 'User';

					// Gets the field name
					var fieldName = name + (fieldType == 'Lookup' || fieldType == 'LookupMulti' || fieldType == 'User' || fieldType == 'UserMulti' ? 'Id' : '');

					// Adjust the field name if necessary.
					// This is for additional read-only fields attached to Lookup and LookupMulti field types.
					if ((fieldType == 'Lookup' || fieldType == 'LookupMulti') && schema.PrimaryFieldId !== null) {

						var primaryFieldSchema = spformController.getFieldSchema(schema.PrimaryFieldId);

						if (primaryFieldSchema !== void 0) {
							fieldName = primaryFieldSchema.InternalName + 'Id';
						}
					}

					// Mount field attributes
					var ngModelAttr = ' ng-model="item.' + fieldName + '"';
					var nameAttr = ' name="' + name + '"';
					var modeAttr = ($attrs.mode ? ' mode="' + $attrs.mode + '"' : '');
					var dependsOnAttr = ($attrs.dependsOn ? ' depends-on="' + $attrs.dependsOn + '"' : '');
					var hiddenAttr = ($attrs.mode == 'hidden' ? ' ng-hide="true"' : '');
					var validationAttributes = ' ng-required="' + schema.Required + '"';
					
					// Specific field type validation attributes
					switch(schema.TypeAsString) {

						case 'Text':
							validationAttributes += ' ng-maxlength="' + schema.MaxLength + '"';
							break;
					}


					// Check for 'render-as' attribute
					if ($attrs.renderAs) {
						fieldType = $attrs.renderAs;
					}
					

					// Mount the field directive HTML
					var fieldControlHTML = '<spfield-' + fieldType + ngModelAttr + nameAttr + modeAttr + dependsOnAttr + hiddenAttr + validationAttributes + '></spfield-' + fieldType + '>';
					var newElement = $compile(fieldControlHTML)($scope);

					$element.replaceWith(newElement);
					$element = newElement;

				} else {

					console.error('Unknown field ' + $attrs.name);
				}

			} // link

		}; // Directive definition object


		return spfieldControl_DirectiveDefinitionObject;

	} // Directive factory

]);