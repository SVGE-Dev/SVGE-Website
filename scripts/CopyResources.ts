import { ncp } from "ncp";

ncp("./src/public", "./dist/public", (err) =>
{
    if (err)
    {
      return console.error(err);
    }
    console.log('Copied Public folder!');
});

ncp("./src/views", "./dist/views", (err) =>
{
    if (err)
    {
      return console.error(err);
    }
    console.log('Copied Views folder!');
});