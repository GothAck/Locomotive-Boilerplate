run:
	supervisor --watch app/controllers,app/models,config,config/environments,config/initializers,node_modules,lib -- node_modules/locomotive/bin/lcm.js server
