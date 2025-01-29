const UserModel = require('../src/models/userModel');
const { executeQuery } = require('../src/services/databaseService');

jest.mock('../src/services/databaseService');

describe('UserModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createUser doit créer un nouvel utilisateur', async () => {
    const mockUser = {
      email: 'test@example.com',
      password: 'motdepasse123',
      nom: 'Dupont',
      prenom: 'Jean',
      telephone: '+225123456789',
      type_utilisateur: 'client'
    };

    executeQuery.mockResolvedValue({
      rows: [{ 
        id: 1, 
        email: mockUser.email, 
        type_utilisateur: mockUser.type_utilisateur 
      }]
    });

    const result = await UserModel.createUser(mockUser);

    expect(executeQuery).toHaveBeenCalled();
    expect(result.email).toBe(mockUser.email);
    expect(result.type_utilisateur).toBe(mockUser.type_utilisateur);
  });

  test('findUserByEmail doit retourner un utilisateur', async () => {
    const mockEmail = 'test@example.com';
    
    executeQuery.mockResolvedValue({
      rows: [{ 
        id: 1, 
        email: mockEmail, 
        nom: 'Dupont',
        prenom: 'Jean' 
      }]
    });

    const result = await UserModel.findUserByEmail(mockEmail);

    expect(executeQuery).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM utilisateurs WHERE email = $1'),
      [mockEmail]
    );
    expect(result.email).toBe(mockEmail);
  });
});
