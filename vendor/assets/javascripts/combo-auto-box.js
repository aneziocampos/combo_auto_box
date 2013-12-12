var ComboAutoBox = {
	// constructor
	addTo: function (container, options) {
		// generatea an ID based on current time
		var generateShortId = function(prefix) {
			var now = 0;
			while ($('input[name*="[' + prefix +"-" + now + ']"]').length != 0) {
				now++;
			}
	
			return prefix + "-" + now;
		};

		// generatea an ID based on current time
		var generateAnId = function(prefix) {
			var now = new Date().getTime();
			while ($("#" + prefix +"-" + now).length != 0) {
				now++;
			}
	
			return prefix + "-" + now;
		};
	
		// binds autocomplete to text field
		var bindAutoComplete = function (inputId) {
			var previuosValue = '';
			$('#' + inputId).keydown(function(e) {
				if ((e.keyCode == 8) && ($('#' + inputId).val() == '')) {
					if (options.type == 'multiple') {
						removeLastMultipleItem();
					} else if (options.type == 'searchable') {
						removeLastSearchableItemForRansack();
					}
				}
			});
		
			$('#' + inputId).keypress(function(e) {
				if ((e.which === 13) && ($('#' + inputId).val() != '')) {
					if (options.type == 'full') {
						$('#' + inputId).autocomplete( "close" );
						selectData($('#' + inputId).val(), $('#' + inputId).val());
					} else if (options.type == 'multiple') {
						$('#' + inputId).autocomplete( "close" );
						addMultipleItem(inputId, $('#' + inputId).val(), $('#' + inputId).val());
						selectData($('#' + inputId).val(), $('#' + inputId).val());
						$('#' + inputId).val('');
					} else if (options.type == 'searchable') {
						try {
							$('#' + inputId).autocomplete('close');
							var item = sourceForSearchable(inputId)[0];
							addSearchableItemForRansack(inputId, item.id, item.label);
							selectData(item.id, item.label);
							$('#' + inputId).val('');
						} catch (error) {
							
						}
					}
					
					return false;
				} else if ((e.which === 13) && ($('#' + inputId).val() == '')) {
					return false;					
				}
			});
					
			$('#' + inputId).autocomplete({
				source: setAutoCompleteSource(inputId),
				select: function(event, ui) {
					if (options.type == 'simple') {
						return selectData(ui.item.id, ui.item.label);
					} else if (options.type == 'full') {
						return selectData($('#' + inputId).val(), $('#' + inputId).val());
					} else if (options.type == 'multiple') {
						$('#' + inputId).val('');
						addMultipleItem(inputId, ui.item.id, ui.item.label);
						selectData(ui.item.id, ui.item.label);
						return false;
					} else if (options.type == 'searchable') {
						$('#' + inputId).val('');
						addSearchableItemForRansack(inputId, ui.item.id, ui.item.label);
						selectData(ui.item.id, ui.item.label);
						return false;
					}
				},
				search: function(event, ui) {
					if (options.type == 'searchable') {
						$('#' + inputId).autocomplete("option", { source: setAutoCompleteSource(inputId) }); 
					}
				},
				change: function (event, ui) {
					if (!ui.item) {
						$(this).val('');
					}
				},
				focus: function (event, ui) {
					event.preventDefault();
				},
			});
		};
	
		// set autocomplete source
		var setAutoCompleteSource = function (inputId) {
			if (options.type == 'searchable') {
				return sourceForSearchable(inputId);
			} else if (typeof options.source == 'string') {
				return function(request, response) {
					var term = 'term=' + $('#' + inputId).val();
					var params = (options.data == null) ? term : options.data + '&' + term;
					return $.getJSON(options.source + '?' + params, response);
				};
			} else {
				return options.source;
			}
		};
		
		// source items for searchable
		var sourceForSearchable = function (inputId) {
			var new_source = new Array();
			var operators = i18nMath(options.lang);
			$.each(options.source, function(i){
				validIndexes = validSource(options.source[i]);
				$.each(operators, function(j){
					if (validIndexes.indexOf(j) >= 0) {
						new_source.push( { id: options.source[i]['id'] + '_' + operators[j]['id'], label: options.source[i]['label'] + ' ' + operators[j]['label'] + ' ' + $('#' + inputId).val()} );
					}
				});
			});
			return new_source;			
		}
	
		// get i18n math comparisons
		var i18nMath = function (language) {
			var operators = new Array();
			switch(language) {
				case 'en':
					operators = [ { id: 'cont', label: 'contains' }, { id: 'eq', label: 'equal' }, { id: 'gteq', label: 'greater or equal' }, { id: 'lteq', label: 'less or equal' } ];
				break;
				case 'pt-br':
					operators = [ { id: 'cont', label: 'contém' }, { id: 'eq', label: 'igual' }, { id: 'gteq', label: 'maior ou igual' }, { id: 'lteq', label: 'menor ou igual' } ];
				break;
				case 'pt':
					operators = [ { id: 'cont', label: 'contém' }, { id: 'eq', label: 'igual' }, { id: 'gteq', label: 'maior ou igual' }, { id: 'lteq', label: 'menor ou igual' } ];
				break;
				case 'fr':
				    operators = [ { id: 'cont', label: 'contient' }, { id: 'eq', label: 'égal' }, { id: 'gteq', label: 'supérieur ou égal' }, { id: 'lteq', label: 'inférieur ou égal' } ];
				break;
				case 'es':
					operators = [ { id: 'cont', label: 'contiene' }, { id: 'eq', label: 'igual' }, { id: 'gteq', label: 'mayor o igual' }, { id: 'lteq', label: 'menos o igual' } ];
				break;
				case 'it':
					operators = [ { id: 'cont', label: 'contiene' }, { id: 'eq', label: 'uguale' }, { id: 'gteq', label: 'maggiore o uguale' }, { id: 'lteq', label: 'minore o uguale' } ];
				break;
				default:
					operators = [ { id: 'cont', label: '~=' }, { id: 'eq', label: '=' }, { id: 'gteq', label: '>=' }, { id: 'lteq', label: '<=' } ];
			}
			return operators;
		};

		var i18nShowSearchOptions = function (language) {
			var title = 'Show search options';
			switch(language) {
				case 'pt-br':
					title = 'Exibir opções de busca';
				break;
				case 'pt':
					title = 'Exibir opções de busca';
				break;
				case 'fr':
				    title = 'Afficher les options de recherche';
				break;
				case 'es':
					title = 'Mostrar opciones de búsqueda';
				break;
				case 'it':
					title = 'Visualizza opzioni di ricerca';
				break;
			}
			return title;
		};
	
		// generates text field with html options
		var generateInputTag = function () {
			var html = 'input type="text"';
			if (options.html != null) {
				$.each(options.html, function(key, value) {
					if ((key == 'name') && ((options.type == 'multiple') || (options.type == 'searchable'))) {
						return true;
					}
		    		html = html + ' '+ key +'="' + value + '"';
				});
			}
	
			if ((options.html == null) || (options.html.id == null)) {
			    html = html + ' id="' + generateAnId('combo-auto-box') + '"';
			}
	
		        return '<' + html + '>';
		};
	
		// On click opens modal image tag inside "i" tag through css
		var generateExpander = function () {
			if (options.type == 'simple') {
		        	return '<span class="simple" title="' + i18nShowSearchOptions(options.lang) + '"><i></i></span>';
			} else if (options.type == 'multiple') {
		        	return '<span class="multiple">' + options.label + ':</span>';
			}
		};
	
		var adjustExpanderImage = function() {
			if (options.type == 'simple') {
				spanTag = $('#' + container + ' > div.container-combo-auto-box > span.simple');
			
				inputWidth = getTextFieldWidth(textField);
				inputHeight = getTextFieldHeight(textField);

				inputBorderTop = getTextFieldBorder(textField, 'top');
				inputBorderBottom = getTextFieldBorder(textField, 'bottom');

				if (inputHeight % 2 != 0) {
					inputBorderTop = inputBorderTop + 2;
				}
			
				iWidth = 20;
				if (inputWidth < 20) {
					iWidth = 10;
				}
			
				spanTag.css('margin-top', inputBorderTop.toString() + 'px');
				spanTag.css('margin-left', (inputWidth - iWidth + 4).toString() + 'px');

				spanTag.children(':first').css('width', iWidth.toString() + 'px');
				spanTag.children(':first').css('height', inputHeight.toString() + 'px');
		
				return true;
			} else if (options.type == 'multiple') {
				inputTop = 0;
				try {
				  inputTop = parseInt(textField.css('margin-top').replace(/px/, ''));
				  inputTop = inputTop + parseInt(textField.css('padding-top').replace(/px/, ''));
				  $('#' + container + ' > div.container-combo-auto-box > span.multiple').css('margin-top', ((textField.height() / 2) - ($('span.multiple').height() / 2) - inputTop).toString() + 'px');
				} catch (error) {
				}
			} else {
				return false;
			}
		}

		var getTextFieldWidth = function (textField) {
			var widthTotal = 0;
			
			if (textField.width() != null) {
				widthTotal = widthTotal + textField.width();
			}

			if (textField.css('padding-right') != null) {
				padding_right = textField.css('padding-right').toString().replace(/[a-zA-Z]+/g, '');
				widthTotal = widthTotal + parseInt(padding_right);
			}
			
			return widthTotal;
		}
		
		var getTextFieldBorder = function (textField, side) {
			var heightTotal = 0;

			try {
				var matched = textField.css('border-' + side).match(/(\d+)(px)/);
				heightTotal = heightTotal + parseInt(matched[1]);
			} catch (error) {
			}

			return heightTotal;
		}
		
		var getTextFieldHeight = function (textField) {
			var heightTotal = 0;

			if (textField.height() != null) {
				heightTotal = heightTotal + textField.height();
			}

			if (textField.css('padding-top') != null) {
				padding_top = textField.css('padding-top').toString().replace(/[a-zA-Z]+/g, '');
				heightTotal = heightTotal + parseInt(padding_top);
			}
			
			if (textField.css('padding-bottom') != null) {
				padding_bottom = textField.css('padding-bottom').toString().replace(/[a-zA-Z]+/g, '');
				heightTotal = heightTotal + parseInt(padding_bottom);
			}
			
			return heightTotal;
		}
	
		// Global div for combo auto box
		var generateDivTag = function () {
			var derivation = ''
			if (options.type == 'multiple') {
				derivation = ' multiple'
			} else if (options.type == 'searchable') {
				derivation = ' searchable'				
			}
		
		    return '<div class="container-combo-auto-box' + derivation + '">' + generateInputTag() + '</div>';
		};
	
		// dialog modal
		var generateDivDialogModal = function (modalDialogId) {
		        $('<div id="'+ modalDialogId +'" class="dialog-modal"><div class="head"><span class="label">' + options.label + '</span><span class="close" title="Close">X</span></div><div class="list"><ul></ul></div></div>').appendTo('#' + container);
	
			$('#' + modalDialogId + ' > div.head > span.close').click(function() {
				$('#' + modalDialogId).dialog('close');
			});
	
			$('#' + modalDialogId).dialog({
				width: 500,
				height: 400,
				modal: true,
				closeOnEscape: true,
				autoOpen: false,
			});
	
			getListForModalDialog(modalDialogId);
		
			$("#" + modalDialogId).siblings('div.ui-dialog-titlebar').remove();
		
			$('#' + container + ' > div.container-combo-auto-box > span.' + options.type).click(function() { 
				openModalDialog(modalDialogId) 
			});
		};
	
		// Selects an item form modal dialog when clicked on
		var selectValueFromModalDialog = function (value) {
			$('#' + container + ' > div.container-combo-auto-box > input').val(value);
			selectData(value);
		};
	
		// generates list for modal dialog
		var getListForModalDialog = function (modalDialogId) {
			if (typeof options.source == 'string') {
				var term = 'term=';
				var params = (options.data == null) ? term : options.data + '&' + term;
	
				$.getJSON(options.source + '?' + params, function(data) {
					setListForModalDialog(modalDialogId, data);
				});
			} else {
				setListForModalDialog(modalDialogId, options.source);
			}
		};
	
		// set list for modal dialog
		var setListForModalDialog = function (modalDialogId, data) {
			var items = [];
		
			$.each(data, function(index){
				items.push('<li><span class="combo-auto-box-item-id">' + data[index].id +'</span><span class="combo-auto-box-item-label">'+ data[index].label + '</span></li>');
			});
		
			$('#' + modalDialogId + ' > div.list').css('height', ($('#' + modalDialogId).dialog("option", "height") - 60) + 'px');
			$('#' + modalDialogId + ' > div.list > ul').html(items.join(''));
			$('#' + modalDialogId + ' > div.list > ul > li').click(function() {
				var thisId = $(this).children('span.combo-auto-box-item-id').text();
				var thisLabel = $(this).children('span.combo-auto-box-item-label').text();
			
				$('#' + modalDialogId).dialog('close');
			
				if (options.type == 'simple') {
					$('#' + container + ' > div.container-combo-auto-box > input').val(thisLabel);
					selectData(thisId, thisLabel);
				} else if (options.type == 'multiple') {
					$('#' + container + ' > div.container-combo-auto-box > input').val('');
					addMultipleItem($('#' + container + ' > div.container-combo-auto-box > input').attr('id'), thisId, thisLabel);
					$('#' + container + ' > div.container-combo-auto-box > input[type="text"]').focus();
					selectData(thisId, thisLabel);
				}
			});			
		};
	
		// opens modal dialog
		var openModalDialog = function (modalDialogId) {
		        $('#' + modalDialogId).dialog("open");
		};
	
		// starting generate modial dialog
		var generateModalDialog = function (textField) {
			$(generateExpander()).prependTo('#' + container + ' > div.container-combo-auto-box');
	
			adjustExpanderImage();
		
			generateDivDialogModal(generateAnId('model-dialog'));			
		};
	
		// add multiple item
		var addMultipleItem = function (inputId, selectedId, selectedData) {
			if (selectedData != '') {
				var id = generateAnId('item');
				$('#' + inputId).before('<div class="item" id="' + id + '">'+ htmlSafe(selectedData) +'<span title="Remove Item">x</span><input type="hidden" name="'+ options.html.name +'[]" value="'+ selectedId +'"></div>');
	
				$('#' + id + ' > span').click(function() {
					$(this).parent().remove();
					unselectData(selectedId, selectedData);
				});
			}
		};
	
		// remove multiple item
		var removeLastMultipleItem = function () {
			if ($('#' + container + ' > div.multiple > div.item').length > 0) {
				var value = $('#' + container + ' > div.multiple > div.item:last > input').val();
				var label = $('#' + container + ' > div.multiple > div.item:last').text();
				$('#' + container + ' > div.multiple > div.item:last').remove();
				unselectData(value, label);
			}
		};
	
		// add searchable item for ransack
		var addSearchableItemForRansack = function (inputId, selectedId, selectedData) {
			if (selectedData != '') {
				var ransackId = generateShortId('r');
				predicate = getSearchablePredicate(selectedId);
				if (getSearchableValue(selectedData) == null) {
					selectedData = predicate['full'] + ' ' + selectedData;
				}
				fieldAttribute = '<input type="hidden" name="q[g]['+ predicate['attribute'] +'][c]['+ ransackId +'][a][0][name]"  value="'+ predicate['attribute'] +'">';
				fieldCondition = '<input type="hidden" name="q[g]['+ predicate['attribute'] +'][c]['+ ransackId +'][p]"           value="'+ predicate['condition'] +'">';
				fieldValue =     '<input type="hidden" name="q[g]['+ predicate['attribute'] +'][c]['+ ransackId +'][v][0][value]" value="'+ getSearchableValue(selectedData) +'">';
				var id = generateAnId('item');
				$('#' + inputId).before('<div class="item" id="' + id + '">'+ htmlSafe(selectedData) +'<span title="Remove Item">x</span>'+ fieldAttribute + fieldCondition + fieldValue +'</div>');
	
				$('#' + id + ' > span').click(function() {
					$(this).parent().remove();
					unselectData(selectedId, selectedData);
				});
			}
		};
		
		var removeLastSearchableItemForRansack = function() {
			if ($('#' + container + ' > div.searchable > div.item').length > 0) {
				var label = $('#' + container + ' > div.searchable > div.item:last > input[name*="value"]').val();
				var attribute = $('#' + container + ' > div.searchable > div.item:last > input[name*="name"]').val();
				var condition = $('#' + container + ' > div.searchable > div.item:last > input[name*="p"]').val();
				$('#' + container + ' > div.searchable > div.item:last').remove();
				unselectData(attribute + "_" + condition, label);
			}			
		}
	
		// add searchable item
		var addSearchableItem = function (inputId, selectedId, selectedData) {			
			if (selectedData != '') {
				var id = generateAnId('item');
				$('#' + inputId).before('<div class="item" id="' + id + '">'+ htmlSafe(selectedData) +'<span title="Remove Item">x</span><input type="hidden" name="'+ options.html.name +'['+ selectedId +'][]" value="'+ getSearchableValue(selectedData) +'"></div>');
	
				$('#' + id + ' > span').click(function() {
					$(this).parent().remove();
					unselectData(selectedId, selectedData);
				});
	
			}
		};
				
		// return json with attribute and condition
		var getSearchablePredicate = function (selectedId) {
			var fields = $.map(options.source, function(val, i) { return val['id']}).join('|');
			var maths = $.map(i18nMath(options.lang), function(val, i) { return val['id']}).join('|');
			var pattern = new RegExp('(' + fields + ')_(' + maths + ')');
			var matched = selectedId.match(pattern);
			var full = getSearchableLabelForAttributeId(matched[1]) + ' ' + getSearchableLabelForConditionId(matched[2]);
			return { attribute: matched[1], condition: matched[2], full: full };
		}
	
		// get only the value from selected Data
		var getSearchableValue = function (selectedData) {
			var fields = $.map(options.source, function(val, i) { return val['label']}).join('|');
			var maths = $.map(i18nMath(options.lang), function(val, i) { return val['label']}).join('|');
			var pattern = new RegExp('(' + fields + ') (' + maths + ') (.*)');
			try {
				return selectedData.match(pattern)[3];
			} catch (error) {
				return null;
			}
		}
		
		var getSearchableLabelForAttributeId = function (attibuteId) {
			for(var i=0; i<options.source.length;i++) {
				if (options.source[i]['id'] == attibuteId) {
					return options.source[i]['label'];
				}
			}
		}

		var getSearchableLabelForConditionId = function (conditionId) {
			var conditions = i18nMath(options.lang);
			for(var i=0; i<conditions.length;i++) {
				if (conditions[i]['id'] == conditionId) {
					return conditions[i]['label'];
				}
			}
		}
		
		var htmlSafe = function(html) {
			html = html.replace(/\&/, '&amp;');
			html = html.replace(/\</, '&lt;');
			html = html.replace(/\>/, '&gt;');
			html = html.replace(/\"/, '&quot;');
			html = html.replace(/\'/, '&#x27;');
			html = html.replace(/\//, '&#x2F;');
			
			return html;
		}
			
		//  Bind click on div for multiple or searchble
		var bindContainerClick = function(inputId) {
			$('#' + container + ' > div.multiple').click(function() {
				$('#' + inputId).focus();
			});			
	
			$('#' + container + ' > div.searchable').click(function() {
				$('#' + inputId).focus();
			});			
		};
		
		var normalizeStyles = function(inputId) {
			$('#' + container).css('background-color', $('#' + inputId).css('background-color'));
			$('#' + inputId).css('border', '0px');
		}
			
		// on select data
		var selectData = function (selectedId, selectedLabel) {
			if (options.complete != null) {
				options.complete(selectedId);
			} else if (options.select != null) {
				options.select(selectedId, selectedLabel);
			}

		};
		
		// on unselect data
		var unselectData = function (selectedId, selectedLabel) {
			if (options.unselect != null) {
				options.unselect(selectedId, selectedLabel);
			}
		};
	
		// valid language or set 'en' as default
		var validLanguage = function () {
			var langs = ['math', 'en', 'pt-br', 'pt', 'es', 'fr'];
			for(var i=0; i<langs.length;i++) {
				if (options.lang == langs[i]) {
					return true;
				}
			}
		
			options.lang = 'en';
			return true;
		};
	
		// valid language or set 'en' as default
		var validType = function () {
			var types = ['simple', 'full', 'multiple', 'searchable'];
			for(var i=0; i<types.length;i++) {
				if (options.type == types[i]) {
					return true;
				}
			}
		
			options.type = 'simple';
			return true;
		};
	
		// valid sources for only and except
		var validSource = function (source) {
			operators = i18nMath('math');
			validIndexes = new Array();
		
			if (((source['only'] != null) && (source['except'] != null)) || ((source['only'] == null) && (source['except'] == null))) {
				for(var i=0; i<operators.length;i++) {
					validIndexes.push(i);
				}
			} else if (source['only'] != null) {
				for(var i=0; i<operators.length;i++) {
					if ((source['only'].indexOf(operators[i]['id']) + source['only'].indexOf(operators[i]['label'])) >= -1) {
						validIndexes.push(i);
					}
				}				
			} else if (source['except'] != null) {
				for(var i=0; i<operators.length;i++) {
					if ((source['except'].indexOf(operators[i]['id']) + source['except'].indexOf(operators[i]['label'])) == -2) {
						validIndexes.push(i);
					}
				}
			}
		
			return validIndexes;
		}
		
		var handleMultipleInitials = function() {
			if (options.initials != null) {
				$.each(options.initials, function(index) {
					addMultipleItem(textField.attr('id'), options.initials[index]['id'], options.initials[index]['label']);
				});
			}
		}

		var handleSearchbleInitials = function() {
			if (options.initials != null) {
				$.each(options.initials, function(index) {
					addSearchableItemForRansack(textField.attr('id'), options.initials[index]['id'], options.initials[index]['label']);
				});
			}
		}
	
		// main
		if (options == null) {
			options = {};
		}
	
		validLanguage();
		validType();
	
		$('#' + container).html(generateDivTag());
	
		textField = $('#' + container + ' > div.container-combo-auto-box > input');
		bindAutoComplete(textField.attr('id'));
	
		if (options.type == 'simple') {
			generateModalDialog(textField);
		}
		
		if (options.type == 'multiple') {
			generateModalDialog(textField);
			bindContainerClick(textField.attr('id'));
			normalizeStyles(textField.attr('id'));
			handleMultipleInitials();
		}

		if (options.type == 'searchable') {
			bindContainerClick(textField.attr('id'));
			normalizeStyles(textField.attr('id'));
			handleSearchbleInitials();
		}

	}
}

