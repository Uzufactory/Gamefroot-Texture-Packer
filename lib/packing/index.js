var BinPacker = require('./binpacker');
var GrowingPacker = require('./growingpacker');
var BasicPacker = require('./basicpacker');

var algorithms = {
  'binpacking': binpackingStrict,
  'growing-binpacking': growingBinpacking,
  'horizontal': horizontal,
  'vertical': vertical
};
exports.pack = function (algorithm, files, options) {
  algorithm = algorithm || 'growing-binpacking';
  var remainingFiles = files.concat();
  options.groups = [];

  while (options.groups.length < options.maxGroups || options.maxGroups < 0) {
    // Details for this texture group
    var group = {
      width: options.width,
      height: options.height
    };
    // Perform the fit
    algorithms[algorithm](remainingFiles, group);

    // Find out which files were fit
    var insertedFiles = [];
    var i = remainingFiles.length;
    while (--i >= 0) {
      var item = remainingFiles[i];
      if (item.fit) {
        item.x = item.fit.x;
        item.y = item.fit.y;
        delete item.fit;
        delete item.w;
        delete item.h;
        insertedFiles.push(item);
        remainingFiles.splice(i,1);
      }
    }

    // If we didn't insert any files, don't continue
    if (insertedFiles.length == 0) {
      break;
    } 
    // Otherwise add another texture group to the result
    else {
      group.files = insertedFiles;
      options.groups.push(group);
    }
  }

  // If we stopped before all the files were packed
  // We either need to throw an error or make a record
  // of said files
  if (remainingFiles.length > 0) {
    if (options.validate) {
      throw new Error("Can't fit all textures in given dimensions");
    } else {
      options.excludedFiles = remainingFiles;
    }
  }
};

function growingBinpacking(files, group) { 
  var packer = new GrowingPacker(group.width,group.height);
  packer.fit(files);
  group.width = packer.root.w;
  group.height = packer.root.h;
};

function binpackingStrict(files, group) {
  var packer = new BinPacker(group.width, group.height);
  packer.fit(files);
  group.width = packer.root.w;
  group.height = packer.root.h;
};

function horizontal(files, group) {
  var packer = new BasicPacker(BasicPacker.HORIZONTAL, group.width, group.height);
  packer.fit(files);
  group.width = packer.width;
  group.height = packer.height;
}

function vertical(files, group) {
  var packer = new BasicPacker(BasicPacker.VERTICAL, group.width, group.height);
  packer.fit(files);
  group.width = packer.width;
  group.height = packer.height;
};