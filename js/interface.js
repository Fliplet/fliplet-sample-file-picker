var data = Fliplet.Widget.getData() || {};

const BTN_SELECTOR = {
  BTN_SELECT_IMAGE: '#select-image',
  BTN_SELECT_MULTIPLE_IMAGES: '#select-multiple-images',
  BTN_SELECT_DOCUMENT: '#select-document',
  BTN_SELECT_MULTIPLE_DOCUMENTS: '#select-multiple-documents',
  BTN_SELECT_PDF: '#select-pdf',
  BTN_SELECT_VIDEO: '#select-video',
  BTN_SELECT_FOLDER: '#select-folder'
};

var $results = $('#results');

var $FILEPICKER;
var providerInstance;

var currentMode = null;

const CONFIGS = data.CONFIGS || {
  'select-image': {
      selectFiles: [],
      selectMultiple: false,
      type: 'image',
      fileExtension: ['JPG', 'JPEG', 'PNG', 'GIF', 'TIFF']
  },
  'select-multiple-images': {
      selectFiles: [],
      selectMultiple: true,
      type: 'image',
      fileExtension: ['JPG', 'JPEG', 'PNG', 'GIF', 'TIFF']
  },
  'select-document': {
      selectFiles: [],
      selectMultiple: false,
      type: 'document',
      fileExtension: ['PDF', 'DOC', 'DOCX', 'KEY', 'PPT', 'ODT', 'XLS', 'XLSX']
  },
  'select-multiple-documents': {
      selectFiles: [],
      selectMultiple: true,
      type: 'document',
      fileExtension: ['PDF', 'DOC', 'DOCX', 'KEY', 'PPT', 'ODT', 'XLS', 'XLSX']
  },
  'select-pdf': {
      selectFiles: [],
      selectMultiple: false,
      type: 'document',
      fileExtension: ['PDF']
  },
  'select-video': {
      selectFiles: [],
      selectMultiple: false,
      type: 'video',
      fileExtension: ['MOV', 'MPEG4', 'MP4', 'AVI', 'WMV', 'FLV', '3GPP', 'WebM']
  },
  'select-folder': {
      selectFiles: [],
      selectMultiple: false,
      type: 'folder',
      fileExtension: []
  }
};


Object.keys(BTN_SELECTOR).forEach(function (key) {
  var selector = BTN_SELECTOR[key];
  var mode = selector.slice(1);
  var config = CONFIGS[mode];

  if (config.selectFiles.length > 0){
    var $el = $(selector).parents('.file-picker-select').find('.result');
    $el.text(JSON.stringify(config.selectFiles, null, 4));
    $el.show();
  }

  $(selector).on('click', function (e) {
    e.preventDefault();

    config.selector = '#file-picker';

    Fliplet.Widget.toggleSaveButton(config.selectFiles.length > 0);
    providerInstance = Fliplet.Widget.open('com.fliplet.file-picker', {
      data: config,
      onEvent: function (e, data) {
        switch (e) {
          case 'widget-rendered':

            beginAnimationFilePicker();
            break;
          case 'widget-set-info':
            Fliplet.Widget.toggleSaveButton(!!data.length);
            var msg = data.length ? data.length + ' files selected' : 'no selected files';
            Fliplet.Widget.info(msg);
            break;
          default:
            break;
        }
      }
    });


    providerInstance.then(function(data) {
      Fliplet.Studio.emit('widget-save-label-update', {  text : 'Save & Close'   });
      Fliplet.Widget.info('');
      Fliplet.Widget.toggleCancelButton(true);
      Fliplet.Widget.toggleSaveButton(true);
      CONFIGS[mode].selectFiles = data.data;
      var $el = $(selector).parents('.file-picker-select').find('.result');
      $el.text(JSON.stringify(data.data, null, 4));
      $el.show();
      providerInstance = null;
    });
  });
});

function beginAnimationFilePicker() {
  Fliplet.Studio.emit('widget-save-label-update', {  text : 'Select'   });
  Fliplet.Widget.toggleCancelButton(false);
  var animProgress = 100;
  var animInterval;
  $FILEPICKER = $('iframe');

  $FILEPICKER.show();

  animInterval = setInterval(function () {
    animProgress -= 2;
    $FILEPICKER.css({left: animProgress + '%'});
    if (animProgress == 0) {
      clearInterval(animInterval);
    }
  }, 5);
}


Fliplet.Widget.onSaveRequest(function () {
  if (providerInstance) {
    return providerInstance.forwardSaveRequest();
  }


  Fliplet.Widget.save({CONFIGS: CONFIGS}).then(function () {
    Fliplet.Widget.complete();
  });
});

window.addEventListener('message', function (event) {
  if (event.data === 'cancel-button-pressed'){
    if (!providerInstance) return;
    providerInstance.close();
    providerInstance = null;
    Fliplet.Studio.emit('widget-save-label-update', {  text : 'Save & Close'   });
    Fliplet.Widget.toggleCancelButton(true);
    Fliplet.Widget.toggleSaveButton(true);
    Fliplet.Widget.info('');
  }
});


//use window.postMessage("save-widget", "*"); to click "Save and click"
