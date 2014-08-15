var cachedModules = {};
// make sure the global "global" variable is available to commonjs modules
window.global = window;

// array for mocks
var mocks = window.__cjs_mocks = window.__cjs_mocks || {};

window.__clearMocks = function() {
   window.__cjs_mocks = {}; 
};

function require(requiringFile, dependency, onlyAutoExec) {

    var dependencyPaths = getDependencyPathCandidates(requiringFile, dependency, window.__cjs_modules_root__);
    var dependencyPath;

    var mockDep = mocks[dependency];
    if (mockDep) {
        return mockDep;
    }

    for (var i=0; i<dependencyPaths.length; i++) {

      dependencyPath = dependencyPaths[i];

      // find module
      var moduleFn = window.__cjs_module__[dependencyPath];
      if (moduleFn !== undefined) {

        if (onlyAutoExec) {
          if (!moduleFn.autoExecute) {
            return;
          }
        }

        // run the module (if necessary)
        var module = cachedModules[dependencyPath];
        if (module === undefined) {
          module = { exports: {} };
          cachedModules[dependencyPath] = module;
          moduleFn(requireFn(dependencyPath), module, module.exports);
        }

        return module.exports;
      }
    }

    // try to get the dependency from the global scope if registered
    var dep = window[dependency];
    
    if (dep) {
        return dep;
    }

    //none of the candidate paths was matching - throw
    throw new Error("Could not find module '" + dependency + "' from '" + requiringFile + "'");
}

function requireFn(basepath) {
    return function(dependency, __mocks) {
        Object.keys(__mocks || {}).forEach(function (key) {
            if (__mocks[key]) {
                mocks[key] = __mocks[key];    
            }
        });
        return require(basepath, dependency);
    };
}

function getDependencyPathCandidates(basePath, relativePath, modulesRoot) {

    if (!isFullPath(basePath)) throw new Error("basePath should be full path, but was [" + basePath + "]");

    if (isFullPath(relativePath)) return [relativePath];
    if (isNpmModulePath(relativePath)) basePath = modulesRoot + '/file.js'; //not pretty, but makes code simpler

    var normalizedPath = normalizeRelativePath(basePath, relativePath);

    var dependencyPathCandidates = [normalizedPath];
    if (normalizedPath.substr(normalizedPath.length - 3) !== ".js") {
        dependencyPathCandidates.push(normalizedPath + ".js");
        dependencyPathCandidates.push(normalizedPath + "/index.js");
    }

    return dependencyPathCandidates;
}

function isFullPath(path) {
  var unixFullPath = (path.charAt(0) === "/");
  var windowsFullPath = (path.indexOf(":") !== -1);

  return unixFullPath || windowsFullPath;
}

function isNpmModulePath(path) {
  return !isFullPath(path) && path.charAt(0) !== ".";
}

function normalizeRelativePath(basePath, relativePath) {

  var baseComponents = basePath.split("/");
  var relativeComponents = relativePath.split("/");
  var nextComponent;

  // remove file portion of basePath before starting
  baseComponents.pop();

  while (relativeComponents.length > 0) {
    nextComponent = relativeComponents.shift();

    if (nextComponent === ".") continue;
    else if (nextComponent === "..") baseComponents.pop();
    else baseComponents.push(nextComponent);
  }

  return baseComponents.join("/");
}