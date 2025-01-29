const ServiceModel = require('../src/models/serviceModel');
const { executeQuery } = require('../src/services/databaseService');

jest.mock('../src/services/databaseService');

describe('ServiceModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('creerService doit créer un nouveau service', async () => {
    const mockService = {
      prestataire_id: 1,
      titre: 'Cours de Mathématiques',
      description: 'Cours particuliers pour lycéens',
      categorie: 'cours_particuliers',
      tarif_horaire: 5000,
      localisation: 'Abidjan'
    };

    executeQuery.mockResolvedValue({
      rows: [{ 
        id: 1, 
        ...mockService 
      }]
    });

    const result = await ServiceModel.creerService(mockService);

    expect(executeQuery).toHaveBeenCalled();
    expect(result.titre).toBe(mockService.titre);
    expect(result.tarif_horaire).toBe(mockService.tarif_horaire);
  });

  test('rechercherServices doit retourner des services', async () => {
    const mockFiltres = {
      categorie: 'cours_particuliers',
      localisation: 'Abidjan'
    };

    executeQuery.mockResolvedValue({
      rows: [
        { 
          id: 1, 
          titre: 'Cours de Mathématiques',
          categorie: 'cours_particuliers',
          localisation: 'Abidjan'
        }
      ]
    });

    const result = await ServiceModel.rechercherServices(mockFiltres);

    expect(executeQuery).toHaveBeenCalled();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].categorie).toBe(mockFiltres.categorie);
  });
});
