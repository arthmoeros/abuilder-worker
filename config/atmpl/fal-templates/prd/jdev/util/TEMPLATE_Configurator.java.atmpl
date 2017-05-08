package ${core:postProcess('##LOCALIZACION##','ALC')}.${core:postProcess('##NEGOCIO##','ALC')}.${core:postProcess('##BACKEND##','ALC')}.${core:postProcess('##OBJDEDATOS##','ALC')}${core:postProcess('##INTERFAZPACKAGE##','ALC','.%%')}.${core:postProcess('##OPECOMBACKEND##','ALC')}.model.util;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import org.apache.log4j.Logger;
import org.apache.log4j.PropertyConfigurator;

/**
 * Clase encargada de las configuraciones.
 * <br>
 * <b>Configurator</b>
 * <br>
 * Utilitario que carga las configuraciones para el EJB.
 * <br>
 * Registro de versiones:
 * <ul>
 * <li>1.0 27/01/2015 Rodolfo Kafack Ghinelli (SEnTRA): Versi�n inicial.</li>
 * </ul>
 */
public class Configurator
{
	
    /**
     * Logger de la clase.
     */
	private static Logger logger = Logger.getLogger(Configurator.class);
    /**
     * Archivo de propiedades.
     */
	private static final String CMR_APP_CONFIG_PATH = "./Corp/AppProperties/&{(auc)negocio}_&{(auc)localizacion}_&{(auc)backend}_##OBJDEDATOS####INTERFAZPACKAGE####OPECOMBACKEND##-&{(urd)versionSvc}.properties";
    /**
     * Atributo que representa la instacia.
     */
	private static Configurator instance = null;
    /**
     * Atributo para setear el archivo de propiedades.
     */
	private Properties properties = null;

  /**
   * M�todo para cargar las configuraciones.
   * <br>
   * Registro de Versiones:
   * <ul>
   * <li>1.0 27/01/2015 Rodolfo Kafack Ghinelli (SEnTRA): Versi�n inicial.</li>
   * </ul>
   * @throws FileNotFoundException.
   * @throw IOException.
   * @since 1.0
   */
  public Configurator() throws FileNotFoundException, IOException {
	  logger.info("[&{(auc)negocio}_&{(auc)localizacion}_&{(auc)backend}_##OBJDEDATOS####INTERFAZPACKAGE####OPECOMBACKEND##-&{(urd)versionSvc}][Configurator] INICIO.");
    InputStream inputStream = null;
    try
    {
      inputStream = new FileInputStream(CMR_APP_CONFIG_PATH);
      this.properties = new Properties();
      this.properties.load(inputStream);
      PropertyConfigurator.configure(this.properties);
      logger.info("[&{(auc)negocio}_&{(auc)localizacion}_&{(auc)backend}_##OBJDEDATOS####INTERFAZPACKAGE####OPECOMBACKEND##-&{(urd)versionSvc}][Configurator] Configuraciones seteadas");
    }
    catch (FileNotFoundException e) {
        logger.error("[&{(auc)negocio}_&{(auc)localizacion}_&{(auc)backend}_##OBJDEDATOS####INTERFAZPACKAGE####OPECOMBACKEND##-&{(urd)versionSvc}][Configurator] No se encontro el archivo de configuracion.");
      throw e;
      
    }
    catch (IOException e) {
        logger.error("[&{(auc)negocio}_&{(auc)localizacion}_&{(auc)backend}_##OBJDEDATOS####INTERFAZPACKAGE####OPECOMBACKEND##-&{(urd)versionSvc}][Configurator] No fue posible leer las propiedades del archivo de configuracion.");
        throw e;
    }
    logger.info("[&{(auc)negocio}_&{(auc)localizacion}_&{(auc)backend}_##OBJDEDATOS####INTERFAZPACKAGE####OPECOMBACKEND##-&{(urd)versionSvc}][Configurator] FIN");
  }
  
  /**
   * M�todo que instancia el configurador.
   * <br>
   * Registro de Versiones:
   * <ul>
   * <li>1.0 27/01/2015 Rodolfo Kafack Ghinelli (SEnTRA): Versi�n inicial.</li>
   * </ul>
   * @throws FileNotFoundException.
   * @throw IOException.
   * @since 1.0
   */
  public static Configurator getInstance() throws FileNotFoundException, IOException {
    if (instance == null)
    {
      instance = new Configurator();
    }
    return instance;
  }
  
  /**
   * M�todo para cargar los valores de las propiedades.
   * <br>
   * Registro de Versiones:
   * <ul>
   * <li>1.0 27/01/2015 Rodolfo Kafack Ghinelli (SEnTRA): Versi�n inicial.</li>
   * </ul>
   * @param String key.
   * @since 1.0
   */
  public String getPropertyValue(String key)
  {
    if ((this.properties != null) && (this.properties.containsKey(key)))
    {
      return this.properties.getProperty(key, null);
    }
    return null;
  }
}