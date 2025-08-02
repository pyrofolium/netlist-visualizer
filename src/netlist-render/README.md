This folder contains all the necessary types and functions to create data structures related to rendering a netlist.

In essence it's similar to the core NetList data type but it needs additional cartesian coordinate information to
specify how to render each component or net.

This data structure is independent of the rendering library, but it contains enough data such that a rendering library
can use it to draw something.

The complex part is how to draw the nets, so the code
to render the net (wires) is contained in it's own folder. 

