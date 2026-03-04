import { AppDataSource } from "src/config/ormconfig";
import { User } from "src/users/entities/user.entity";

async function seedExample() {
    await AppDataSource.initialize();
    AppDataSource.setOptions({ logging: false })

    const userRepo = AppDataSource.getMongoRepository(User);

    const userCount = await userRepo.count();

    if (userCount > 0) {
        return;
    }
}

seedExample()
    .catch((err) => console.log(err))
    .finally(() => {
        if (AppDataSource.isInitialized) {
            AppDataSource.destroy();
        }
    })