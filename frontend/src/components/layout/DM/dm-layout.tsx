import AddFriend from "./add-friend";
import Friends from "./friends";


const DMLayout = ({isAddingFriend}:{isAddingFriend:boolean}) => {


  return (
    <>
      <div className="p-4">
        {isAddingFriend ? (
          <AddFriend />
        ):(
          <Friends />
        )}
      </div>
    </>
  );
};

export default DMLayout;
